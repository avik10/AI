const mongoose = require('mongoose');

const WhatsAppDataSchema = new mongoose.Schema({
  userId: { type: String, default: 'default_user' },
  phoneNumberId: { type: String, default: '' },
  wabaId: { type: String, default: '' },
  messageHistory: [{
    sender: String,
    recipient: String,
    messageText: String,
    timestamp: { type: Date, default: Date.now },
    direction: { type: String, enum: ['inbound', 'outbound'] }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WhatsAppData', WhatsAppDataSchema);
