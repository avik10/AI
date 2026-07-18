const mongoose = require('mongoose');

const InstagramDataSchema = new mongoose.Schema({
  userId: { type: String, default: 'default_user' },
  profile: {
    id: { type: String, default: '' },
    username: { type: String, default: '' },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    picture: { type: String, default: '' },
    bio: { type: String, default: '' },
    birthday: { type: String, default: '' }
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InstagramData', InstagramDataSchema);
