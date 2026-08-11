const { v4: uuidv4 } = require('uuid');

/**
 * Generate a secure QR token for a booking.
 * Contains only a random token — NO sensitive customer data.
 * @param {string} bookingId - The booking's MongoDB _id (for reference, not embedded in token)
 * @returns {string} Secure QR token
 */
const generateQRToken = () => {
  return `QR-${uuidv4()}`;
};

module.exports = generateQRToken;
