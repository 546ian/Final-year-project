const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');
const { initiateStkPush, normalizePhoneNumber } = require('../services/daraja');

const router = express.Router();

const getDarajaPaymentTarget = (businessProfile) =>
  businessProfile?.mpesa_till || businessProfile?.mpesa_paybill || null;

const extractCallbackMetadata = (items = []) =>
  items.reduce((acc, item) => {
    if (!item || !item.Name) {
      return acc;
    }
    acc[item.Name] = item.Value;
    return acc;
  }, {});

const extractStkCallback = (body) => {
  const stkCallback = body?.Body?.stkCallback;
  if (!stkCallback) {
    return null;
  }

  const metadata = extractCallbackMetadata(stkCallback.CallbackMetadata?.Item);
  return {
    checkoutRequestId: stkCallback.CheckoutRequestID,
    merchantRequestId: stkCallback.MerchantRequestID,
    resultCode: stkCallback.ResultCode,
    resultDesc: stkCallback.ResultDesc,
    amount: metadata.Amount || null,
    receiptNumber: metadata.MpesaReceiptNumber || null,
    transactionDate: metadata.TransactionDate || null,
    phoneNumber: metadata.PhoneNumber || null
  };
};

const buildDarajaResponse = (stkResponse) => ({
  message: stkResponse?.CustomerMessage || 'Payment prompt sent successfully.',
  checkoutRequestId: stkResponse?.CheckoutRequestID || null,
  merchantRequestId: stkResponse?.MerchantRequestID || null,
  status: 'pending'
});

// Initiate M-Pesa payment
router.post('/mpesa/initiate', authMiddleware, async (req, res) => {
  let paymentId = null;

  try {
    const { amount, phone_number, description } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    const normalizedPhone = normalizePhoneNumber(phone_number);

    const businessResult = await pool.query(
      'SELECT id, business_name, mpesa_paybill, mpesa_till FROM business_profiles WHERE user_id = $1',
      [req.user.id]
    );
    const businessProfile = businessResult.rows[0] || null;
    const businessId = businessProfile?.id || null;
    const paymentTarget = getDarajaPaymentTarget(businessProfile);

    if (!paymentTarget) {
      return res.status(400).json({ error: 'Business must enroll M-Pesa payment settings before sending a prompt.' });
    }

    const insertResult = await pool.query(
      `INSERT INTO payments (user_id, business_id, amount, payment_method, mpesa_phone, status, description)
       VALUES ($1, $2, $3, 'mpesa', $4, 'pending', $5)
       RETURNING id`,
      [req.user.id, businessId, amount, normalizedPhone, description || `Payment request from ${businessProfile.business_name || 'business'}`]
    );

    paymentId = insertResult.rows[0].id;

    const stkResponse = await initiateStkPush({
      amount,
      phoneNumber: normalizedPhone,
      accountReference: paymentTarget,
      transactionDesc: description || `Payment request from ${businessProfile.business_name || 'business'}`,
      transactionType: businessProfile.mpesa_till ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline'
    });

    await pool.query(
      'UPDATE payments SET transaction_ref = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [stkResponse.CheckoutRequestID, paymentId]
    );

    res.json({
      ...buildDarajaResponse(stkResponse),
      paymentId,
      phone_number: normalizedPhone,
      paymentTarget
    });
  } catch (error) {
    console.error('Daraja payment initiation failed:', error);

    if (paymentId) {
      await pool.query(
        'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['failed', paymentId]
      );
    }

    const message =
      error?.response?.data?.errorMessage ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to initiate payment';

    res.status(500).json({ error: message });
  }
});

// Check payment status
router.get('/mpesa/:paymentId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE id = $1 AND user_id = $2',
      [req.params.paymentId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Get payment history
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Webhook for M-Pesa payment confirmation (receives from M-Pesa)
router.post('/mpesa/callback', async (req, res) => {
  try {
    const stkCallback = extractStkCallback(req.body);

    if (stkCallback) {
      if (!stkCallback.checkoutRequestId) {
        return res.status(400).json({ error: 'Missing checkout request ID' });
      }

      const paymentResult = await pool.query(
        'SELECT id FROM payments WHERE transaction_ref = $1 LIMIT 1',
        [stkCallback.checkoutRequestId]
      );

      if (paymentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const paymentId = paymentResult.rows[0].id;
      const success = Number(stkCallback.resultCode) === 0;

      await pool.query(
        `UPDATE payments
         SET status = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [success ? 'completed' : 'failed', paymentId]
      );

      return res.json({
        message: 'Payment processed',
        paymentId,
        status: success ? 'completed' : 'failed',
        receiptNumber: stkCallback.receiptNumber || null
      });
    }

    const { paymentId, status, transactionRef } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Missing paymentId' });
    }

    if (status === 'successful') {
      await pool.query(
        'UPDATE payments SET status = $1, transaction_ref = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        ['completed', transactionRef, paymentId]
      );
    } else {
      await pool.query(
        'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['failed', paymentId]
      );
    }

    res.json({ message: 'Payment processed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

module.exports = router;
