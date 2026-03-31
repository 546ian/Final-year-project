const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Initiate M-Pesa payment
router.post('/mpesa/initiate', authMiddleware, async (req, res) => {
  try {
    const { amount, phone_number, description } = req.body;

    // Create payment record
    const result = await pool.query(
      `INSERT INTO payments (user_id, amount, payment_method, mpesa_phone, status, description)
       VALUES ($1, $2, 'mpesa', $3, 'pending', $4)
       RETURNING id`,
      [req.user.id, amount, phone_number, description]
    );

    const paymentId = result.rows[0].id;

    // TODO: Integrate with actual M-Pesa API
    // For now, we just create the payment record

    res.json({ 
      message: 'Payment initiated', 
      paymentId,
      status: 'pending'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to initiate payment' });
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
    const { paymentId, status, transactionRef } = req.body;

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
