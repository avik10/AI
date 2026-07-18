const mongoose = require('mongoose');

const ConnectionSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['facebook', 'whatsapp', 'instagram', 'linkedin', 'googlephotos', 'openai']
  },
  userId: {
    type: String,
    required: true,
    default: 'default_user'
  },
  connected: {
    type: Boolean,
    default: false
  },
  credentials: {
    apiKey: { type: String, default: '' },
    accessToken: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
    clientId: { type: String, default: '' },
    clientSecret: { type: String, default: '' },
    phoneNumberId: { type: String, default: '' }, // Specific for WhatsApp Business
    wabaId: { type: String, default: '' } // WhatsApp Business Account ID
  },
  settings: {
    autoReply: { type: Boolean, default: false },
    autoPost: { type: Boolean, default: false },
    syncIntervalMinutes: { type: Number, default: 60 }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ConnectionSchema.index({ platform: 1, userId: 1 }, { unique: true });

// Middleware to update the updatedAt timestamp
ConnectionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Connection', ConnectionSchema);
