const mongoose = require('mongoose');

const AgentDataSchema = new mongoose.Schema({
  userId: { type: String, default: 'default_user' },
  appName: { type: String, default: 'Personal Agent' },
  userSupportEmail: { type: String, default: 'avik.bhattacharjya28@gmail.com' },
  appLogo: { type: String, default: '' },
  syncedPlatforms: [{
    platform: String,
    lastSyncedAt: Date,
    status: String
  }],
  activityLogs: [{
    timestamp: { type: Date, default: Date.now },
    platform: String,
    event: String,
    details: String
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AgentData', AgentDataSchema);
