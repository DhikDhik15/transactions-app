const crypto = require('crypto');

function generateInvoiceNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `INV${date}-${random}`;
}

module.exports = {
  generateInvoiceNumber,
};
