const axios = require('axios');
const config = require('../config/constants');

const getDarajaBaseUrl = () =>
  process.env.MPESA_BASE_URL ||
  (process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke');

const normalizePhoneNumber = (phoneNumber) => {
  const digits = String(phoneNumber || '').replace(/\D/g, '');

  if (!digits) {
    throw new Error('Phone number is required');
  }

  if (digits.startsWith('254') && digits.length === 12) {
    return digits;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }

  if (digits.length === 9) {
    return `254${digits}`;
  }

  throw new Error('Phone number must be in a valid Kenyan format');
};

const getTimestamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join('');
};

const buildPassword = (shortcode, passkey, timestamp) =>
  Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

const getAccessToken = async () => {
  if (!config.mpesa_consumer_key || !config.mpesa_consumer_secret) {
    throw new Error('Daraja consumer key/secret are not configured');
  }

  const auth = Buffer.from(
    `${config.mpesa_consumer_key}:${config.mpesa_consumer_secret}`
  ).toString('base64');

  const response = await axios.get(
    `${getDarajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`
      }
    }
  );

  if (!response.data?.access_token) {
    throw new Error('Unable to obtain Daraja access token');
  }

  return response.data.access_token;
};

const initiateStkPush = async ({
  amount,
  phoneNumber,
  accountReference,
  transactionDesc,
  transactionType
}) => {
  if (!config.mpesa_shortcode || !config.mpesa_passkey) {
    throw new Error('Daraja shortcode/passkey are not configured');
  }

  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  const accessToken = await getAccessToken();
  const timestamp = getTimestamp();
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ||
    `http://localhost:${process.env.PORT || 5000}/api/payments/mpesa/callback`;

  const response = await axios.post(
    `${getDarajaBaseUrl()}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: config.mpesa_shortcode,
      Password: buildPassword(config.mpesa_shortcode, config.mpesa_passkey, timestamp),
      Timestamp: timestamp,
      TransactionType: transactionType || 'CustomerPayBillOnline',
      Amount: numericAmount,
      PartyA: normalizedPhone,
      PartyB: config.mpesa_shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: String(accountReference || 'Gamelink').slice(0, 12),
      TransactionDesc: String(transactionDesc || 'Payment request').slice(0, 13)
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  return {
    ...response.data,
    normalizedPhone,
    callbackUrl,
    timestamp
  };
};

module.exports = {
  initiateStkPush,
  normalizePhoneNumber,
  getDarajaBaseUrl
};
