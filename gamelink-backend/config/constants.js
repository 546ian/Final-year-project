require('dotenv').config();

module.exports = {
  jwt_secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwt_expiry: process.env.JWT_EXPIRY || '7d',
  bcrypt_rounds: 10,
  mpesa_consumer_key: process.env.MPESA_CONSUMER_KEY,
  mpesa_consumer_secret: process.env.MPESA_CONSUMER_SECRET,
  mpesa_shortcode: process.env.MPESA_SHORTCODE,
  mpesa_passkey: process.env.MPESA_PASSKEY
};
