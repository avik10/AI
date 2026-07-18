const mongoose = require('mongoose');

const LinkedInDataSchema = new mongoose.Schema({
  userId: { type: String, default: 'default_user' },
  profile: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    picture: { type: String, default: '' },
    bio: { type: String, default: '' },
    birthday: { type: String, default: '' }
  },
  feeds: [{
    id: String,
    text: String,
    createdAt: Date,
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LinkedInData', LinkedInDataSchema);
