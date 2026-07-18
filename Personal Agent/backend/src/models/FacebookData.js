const mongoose = require('mongoose');

const FacebookDataSchema = new mongoose.Schema({
  userId: { type: String, default: 'default_user' },
  profile: {
    id: { type: String, default: '' },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    picture: { type: String, default: '' },
    bio: { type: String, default: '' },
    birthday: { type: String, default: '' }
  },
  personalFeed: [{
    id: String,
    message: String,
    story: String,
    created_time: Date
  }],
  pages: [{
    id: String,
    name: String,
    category: String,
    posts: [{
      id: String,
      message: String,
      created_time: Date
    }]
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FacebookData', FacebookDataSchema);
