const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const Connection = require('./models/Connection');
const FacebookData = require('./models/FacebookData');
const InstagramData = require('./models/InstagramData');
const WhatsAppData = require('./models/WhatsAppData');
const LinkedInData = require('./models/LinkedInData');
const AgentData = require('./models/AgentData');
const AgentUser = require('./models/AgentUser');
const {
  generateChatReply,
  generatePhotoCaption
} = require('./services/openaiService');
const {
  fetchGooglePhotos,
  postToFacebook,
  postToInstagram,
  postToLinkedIn,
  sendWhatsAppMessage,
  fetchLinkedInProfileAndFeeds,
  sendLinkedInMessage,
  fetchFacebookProfileAndPages,
  fetchInstagramProfileDetails,
  sendFacebookMessage
} = require('./services/socialServices');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@127.0.0.1:27017/socialsync?authSource=admin';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Initial seeding of platforms if not present
const PLATFORMS = ['facebook', 'whatsapp', 'instagram', 'linkedin', 'googlephotos', 'openai'];
async function seedPlatforms() {
  try {
    // Seed default user
    let defaultUser = await AgentUser.findOne({ userId: 'default_user' });
    if (!defaultUser) {
      await AgentUser.create({
        userId: 'default_user',
        name: 'Default Agent Operator',
        email: 'operator@personalagent.ai'
      });
      console.log('Seeded default user profile: default_user');
    }

    let fbToken = process.env.FACEBOOK_ACCESS_TOKEN || "EAAf5AIiK2LkBR0BtNKlPtEjubEQtFxZAZCWj6kLtih35ChPz1vI0c76lhgyv4d8aiV7pDiM7QeQtTU24tEp6kcjyoeAl3CeKM0400w7TAIiZCrRXXr2iRoZAvNbeYK6d9PWBSQIAxbApo2nfxDxJxaGZBuWb0fNgSCpJ9GIV5zoYg48EkSdOBrHk2bzEt0ZCsTU2LjHiAZAo4Fel6G97U7Ki7cthUTg8kFl-";
    fbToken = fbToken.trim();
    if (fbToken.endsWith('-')) {
      fbToken = fbToken.slice(0, -1);
    }

    await Connection.updateMany({}, { $set: { connected: false } });
    for (const platform of PLATFORMS) {
      const exists = await Connection.findOne({ platform, userId: 'default_user' });
      if (!exists) {
        const connData = { platform, userId: 'default_user', connected: false };
        if (platform === 'facebook' || platform === 'instagram') {
          connData.credentials = { accessToken: fbToken };
        }
        await Connection.create(connData);
        console.log(`Seeded platform: ${platform} for default_user`);
      } else {
        if (platform === 'facebook' || platform === 'instagram') {
          exists.credentials = { accessToken: fbToken };
          await exists.save();
        }
      }
    }
  } catch (error) {
    console.error('Error seeding platforms:', error);
  }
}
seedPlatforms();

// LinkedIn OAuth redirect route
app.get('/api/auth/linkedin', (req, res) => {
  const { userId } = req.query;
  const targetUserId = userId || 'default_user';
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI);
  const state = encodeURIComponent(JSON.stringify({ userId: targetUserId, nonce: 'linkedin_state_123' }));
  const scope = encodeURIComponent('w_member_social openid profile email');

  // If Client ID is default placeholder, mock the flow redirect directly back to callback with code
  if (!clientId || clientId === 'your_linkedin_client_id') {
    console.log('[LinkedIn OAuth] Simulator Mode: Redirecting directly to local callback handler.');
    return res.redirect(`/api/auth/linkedin/callback?code=mock_authorization_code_98765&state=${state}`);
  }

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
  res.redirect(authUrl);
});

// LinkedIn OAuth callback route
app.get('/api/auth/linkedin/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('LinkedIn OAuth callback error:', error_description || error);
    return res.redirect('http://localhost:3000?auth=linkedin_failed&error=' + encodeURIComponent(error_description || error));
  }

  let targetUserId = 'default_user';
  try {
    if (state) {
      const decodedState = JSON.parse(decodeURIComponent(state));
      if (decodedState && decodedState.userId) {
        targetUserId = decodedState.userId;
      }
    }
  } catch (e) {
    console.warn('[LinkedIn OAuth] Failed to parse state JSON:', e.message);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  try {
    let accessToken = 'sim_oauth_access_token_' + Math.random().toString(36).substr(2, 9);

    // Swap auth code for access token if not in simulation mode
    if (clientId && clientId !== 'your_linkedin_client_id' && !code.startsWith('mock_')) {
      const tokenRes = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      accessToken = tokenRes.data.access_token;
    }

    // Save token to DB and set connection as active
    await Connection.findOneAndUpdate(
      { platform: 'linkedin', userId: targetUserId },
      {
        connected: true,
        'credentials.accessToken': accessToken,
        updatedAt: Date.now()
      },
      { upsert: true }
    );

    // Automatically trigger initial LinkedIn sync
    try {
      const syncResult = await fetchLinkedInProfileAndFeeds(targetUserId);
      await LinkedInData.findOneAndUpdate(
        { userId: targetUserId },
        {
          profile: {
            firstName: syncResult.profile.firstName,
            lastName: syncResult.profile.lastName,
            email: 'avik.bhattacharjya28@gmail.com',
            picture: syncResult.profile.profilePictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
            bio: syncResult.profile.headline || 'Professional profile on LinkedIn.',
            birthday: '1998-10-28'
          },
          feeds: syncResult.feeds.map(f => ({
            id: f.id,
            text: f.text,
            createdAt: f.createdAt,
            views: f.views || 0,
            likes: f.likes || 0,
            comments: f.comments || 0
          })),
          updatedAt: new Date()
        },
        { upsert: true }
      );

      await AgentData.findOneAndUpdate(
        { userId: 'default_user' },
        {
          $push: {
            activityLogs: {
              timestamp: new Date(),
              platform: 'linkedin',
              event: 'SYNC_COMPLETE',
              details: `Synced LinkedIn profile and ${syncResult.feeds.length} posts`
            }
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
      console.log(`[LinkedIn OAuth] Successfully ran initial sync for operator: ${targetUserId}`);
    } catch (syncErr) {
      console.error('[LinkedIn OAuth] Initial sync failed:', syncErr.message);
    }

    console.log(`[LinkedIn OAuth] Connection successfully updated for user ${targetUserId} with access token.`);
    res.redirect('http://localhost:3000?auth=linkedin_success');
  } catch (err) {
    console.error('Error swapping code for token:', err.response?.data || err.message);
    res.redirect('http://localhost:3000?auth=linkedin_failed&error=' + encodeURIComponent(err.message));
  }
});

// Google Photos OAuth redirect route
app.get('/api/auth/google', (req, res) => {
  const { userId } = req.query;
  const targetUserId = userId || 'default_user';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.GOOGLE_REDIRECT_URI);
  const state = encodeURIComponent(JSON.stringify({ userId: targetUserId, nonce: 'google_state_123' }));
  const scope = encodeURIComponent('https://www.googleapis.com/auth/photoslibrary');

  // If Client ID is placeholder, mock flow redirect directly back to callback with code
  if (!clientId || clientId === 'your_google_client_id') {
    console.log('[Google OAuth] Simulator Mode: Redirecting directly to local callback handler.');
    return res.redirect(`/api/auth/google/callback?code=mock_google_authorization_code_98765&state=${state}`);
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
  res.redirect(authUrl);
});

// Google Photos OAuth callback route
app.get('/api/auth/google/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('Google OAuth callback error:', error_description || error);
    return res.redirect('http://localhost:3000?auth=google_failed&error=' + encodeURIComponent(error_description || error));
  }

  let targetUserId = 'default_user';
  try {
    if (state) {
      const decodedState = JSON.parse(decodeURIComponent(state));
      if (decodedState && decodedState.userId) {
        targetUserId = decodedState.userId;
      }
    }
  } catch (e) {
    console.warn('[Google OAuth] Failed to parse state JSON:', e.message);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  try {
    let accessToken = 'sim_google_oauth_access_token_' + Math.random().toString(36).substr(2, 9);
    let refreshToken = '';

    // Swap auth code for access token if not in simulation mode
    if (clientId && clientId !== 'your_google_client_id' && !code.startsWith('mock_')) {
      const tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      accessToken = tokenRes.data.access_token;
      refreshToken = tokenRes.data.refresh_token || '';
    }

    // Save token to DB and set connection as active for this operator
    await Connection.findOneAndUpdate(
      { platform: 'googlephotos', userId: targetUserId },
      {
        connected: true,
        'credentials.accessToken': accessToken,
        'credentials.refreshToken': refreshToken,
        updatedAt: Date.now()
      },
      { upsert: true }
    );

    console.log(`[Google OAuth] Connection successfully updated for user ${targetUserId} with Google access token.`);
    res.redirect('http://localhost:3000?auth=google_success');
  } catch (err) {
    console.error('Error swapping Google code for token:', err.response?.data || err.message);
    res.redirect('http://localhost:3000?auth=google_failed&error=' + encodeURIComponent(err.message));
  }
});

// Facebook/Instagram OAuth redirect route
app.get('/api/auth/facebook', (req, res) => {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI);
  const state = 'random_facebook_state_123';
  const configId = process.env.FACEBOOK_CONFIG_ID;

  // If Client ID is placeholder, mock flow redirect directly back to callback with code
  if (!clientId || clientId === 'your_facebook_client_id') {
    console.log('[Facebook OAuth] Simulator Mode: Redirecting directly to local callback handler.');
    return res.redirect(`/api/auth/facebook/callback?code=mock_facebook_authorization_code_98765&state=${state}`);
  }

  let authUrl;
  if (configId && configId !== 'your_facebook_config_id') {
    authUrl = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&config_id=${configId}&state=${state}`;
  } else {
    const scope = encodeURIComponent('public_profile,email');
    authUrl = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
  }

  res.redirect(authUrl);
});

// Facebook/Instagram OAuth callback route
app.get('/api/auth/facebook/callback', async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    console.error('Facebook OAuth callback error:', error_description || error);
    return res.redirect('http://localhost:3000?auth=facebook_failed&error=' + encodeURIComponent(error_description || error));
  }

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  try {
    let accessToken = 'sim_facebook_oauth_access_token_' + Math.random().toString(36).substr(2, 9);

    if (clientId && clientId !== 'your_facebook_client_id' && !code.startsWith('mock_')) {
      const tokenRes = await axios.get('https://graph.facebook.com/v25.0/oauth/access_token', {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code
        }
      });
      accessToken = tokenRes.data.access_token;
    }

    // Save Meta token to BOTH facebook and instagram connection models in DB!
    await Connection.findOneAndUpdate(
      { platform: 'facebook' },
      {
        connected: true,
        'credentials.accessToken': accessToken,
        updatedAt: Date.now()
      },
      { upsert: true }
    );

    await Connection.findOneAndUpdate(
      { platform: 'instagram' },
      {
        connected: true,
        'credentials.accessToken': accessToken,
        updatedAt: Date.now()
      },
      { upsert: true }
    );

    console.log('[Facebook OAuth] Connection successfully updated for Facebook and Instagram.');
    res.redirect('http://localhost:3000?auth=facebook_success');
  } catch (err) {
    console.error('Error swapping Facebook code for token:', err.response?.data || err.message);
    res.redirect('http://localhost:3000?auth=facebook_failed&error=' + encodeURIComponent(err.message));
  }
});

// GET configuration keys for frontend SDK initialization
app.get('/api/config', (req, res) => {
  res.json({
    facebookClientId: process.env.FACEBOOK_CLIENT_ID || '2244105523091641',
    facebookConfigId: process.env.FACEBOOK_CONFIG_ID || ''
  });
});

// POST Sign Up a new AgentUser
app.post('/api/users/signup', async (req, res) => {
  const { userId, name, email, role } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const exists = await AgentUser.findOne({ userId: userId.trim() });
    if (exists) {
      return res.status(400).json({ error: 'User ID already exists. Please choose a different User ID or Sign In.' });
    }

    const user = await AgentUser.create({
      userId: userId.trim(),
      name: name || '',
      email: email || '',
      role: role || 'agent_operator'
    });

    console.log(`[Sign Up] Created new Operator Profile: ${user.userId}`);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all connection statuses for a user
app.get('/api/connections', async (req, res) => {
  const { userId } = req.query;
  const targetUserId = userId || 'default_user';
  try {
    // Ensure the AgentUser exists in our db
    let user = await AgentUser.findOne({ userId: targetUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register via the Sign Up tab first!' });
    }

    // Reset all connections to deactivated status on every refresh for this user
    await Connection.updateMany({ userId: targetUserId }, { $set: { connected: false } });

    // Seed platform list for this specific user if not present
    for (const platform of PLATFORMS) {
      const exists = await Connection.findOne({ platform, userId: targetUserId });
      if (!exists) {
        await Connection.create({ platform, userId: targetUserId, connected: false });
        console.log(`Seeded platform: ${platform} for user: ${targetUserId}`);
      }
    }

    const connections = await Connection.find({ userId: targetUserId });
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST toggle connection for a user
app.post('/api/connections/toggle', async (req, res) => {
  const { platform, credentials, forceConnect, saveOnly, userId } = req.body;
  const targetUserId = userId || 'default_user';
  try {
    let user = await AgentUser.findOne({ userId: targetUserId });
    if (!user) {
      return res.status(404).json({ error: 'User session not found.' });
    }

    let connection = await Connection.findOne({ platform, userId: targetUserId });
    if (!connection) {
      connection = await Connection.create({ platform, userId: targetUserId, connected: false });
    }

    if (forceConnect) {
      connection.connected = true;
    } else if (saveOnly) {
      // do not change status
    } else {
      connection.connected = !connection.connected;
    }

    if (credentials) {
      connection.credentials = { ...connection.credentials, ...credentials };
    }
    await connection.save();

    res.json({ success: true, connection });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Trigger Single-Click Sync (fetch google photos, caption with OpenAI, post to social)
app.post('/api/sync', async (req, res) => {
  const { targetPlatform, userId } = req.body || {};
  const syncUserId = userId || 'default_user';
  const logs = [];
  try {
    if (targetPlatform === 'linkedin') {
      logs.push('Initiating LinkedIn profile and feed data sync...');
      const linkedinConn = await Connection.findOne({ platform: 'linkedin', userId: syncUserId });
      if (!linkedinConn || !linkedinConn.connected) {
        return res.status(400).json({ error: 'LinkedIn is not connected/toggled on.', logs });
      }

      const dataSync = await fetchLinkedInProfileAndFeeds(syncUserId);
      logs.push(`Successfully Synced Profile: ${dataSync.profile.firstName} ${dataSync.profile.lastName}`);
      logs.push(`Headline: "${dataSync.profile.headline}"`);
      logs.push(`Retrieved ${dataSync.feeds.length} recent posts/shares from profile.`);
      dataSync.feeds.forEach((f, idx) => {
        logs.push(`[Post #${idx + 1}] "${f.text.substring(0, 70)}..." (Likes: ${f.likes}, Comments: ${f.comments})`);
      });
      logs.push('LinkedIn sync sequence complete.');

      await LinkedInData.findOneAndUpdate(
        { userId: syncUserId },
        {
          profile: {
            firstName: dataSync.profile.firstName,
            lastName: dataSync.profile.lastName,
            email: 'avik.bhattacharjya28@gmail.com',
            picture: dataSync.profile.profilePictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
            bio: dataSync.profile.headline || 'Professional profile on LinkedIn.',
            birthday: '1998-10-28'
          },
          feeds: dataSync.feeds.map(f => ({
            id: f.id,
            text: f.text,
            createdAt: f.createdAt,
            views: f.views || 0,
            likes: f.likes || 0,
            comments: f.comments || 0
          })),
          updatedAt: new Date()
        },
        { upsert: true }
      );

      await AgentData.findOneAndUpdate(
        { userId: 'default_user' },
        {
          $push: {
            activityLogs: {
              timestamp: new Date(),
              platform: 'linkedin',
              event: 'SYNC_COMPLETE',
              details: `Synced LinkedIn profile and ${dataSync.feeds.length} posts`
            }
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );

      return res.json({
        success: true,
        logs,
        profile: {
          firstName: dataSync.profile.firstName,
          lastName: dataSync.profile.lastName,
          email: 'avik.bhattacharjya28@gmail.com',
          picture: dataSync.profile.profilePictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
          bio: dataSync.profile.headline || 'Professional profile on LinkedIn.',
          birthday: '1998-10-28'
        }
      });
    }

    if (targetPlatform === 'facebook') {
      logs.push('Initiating Facebook profile and page feeds data sync...');
      const facebookConn = await Connection.findOne({ platform: 'facebook', userId: syncUserId });
      if (!facebookConn || !facebookConn.connected) {
        return res.status(400).json({ error: 'Facebook is not connected/toggled on.', logs });
      }

      const dataSync = await fetchFacebookProfileAndPages(syncUserId);
      logs.push(`Successfully Synced Profile: ${dataSync.profile.name} (ID: ${dataSync.profile.id})`);
      logs.push(`Retrieved ${dataSync.personalFeed.length} posts from personal feed timeline.`);
      dataSync.personalFeed.slice(0, 5).forEach((post, idx) => {
        const text = post.message || post.story || '[Media Share]';
        logs.push(`  ├─ [Personal Post #${idx + 1}] "${text.substring(0, 50)}..." (${new Date(post.created_time).toLocaleDateString()})`);
      });
      logs.push(`Retrieved ${dataSync.pages.length} connected Facebook Pages.`);
      dataSync.pages.forEach(p => {
        logs.push(`[Page] ${p.name} (Category: ${p.category})`);
        p.posts.forEach((post, postIdx) => {
          const text = post.message || '[Image/Link Post]';
          logs.push(`  └─ [Post #${postIdx + 1}] "${text.substring(0, 50)}..." (${new Date(post.created_time).toLocaleDateString()})`);
        });
      });
      logs.push('Facebook sync sequence complete.');

      await FacebookData.findOneAndUpdate(
        { userId: syncUserId },
        {
          profile: {
            id: dataSync.profile.id,
            name: dataSync.profile.name,
            email: dataSync.profile.email,
            picture: dataSync.profile.picture,
            bio: dataSync.profile.bio,
            birthday: dataSync.profile.birthday
          },
          personalFeed: dataSync.personalFeed.map(post => ({
            id: post.id,
            message: post.message,
            story: post.story,
            created_time: post.created_time
          })),
          pages: dataSync.pages.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            posts: p.posts.map(post => ({
              id: post.id,
              message: post.message,
              created_time: post.created_time
            }))
          })),
          updatedAt: new Date()
        },
        { upsert: true }
      );

      await AgentData.findOneAndUpdate(
        { userId: syncUserId },
        {
          $push: {
            activityLogs: {
              timestamp: new Date(),
              platform: 'facebook',
              event: 'SYNC_COMPLETE',
              details: `Synced Facebook profile and ${dataSync.pages.length} pages for User ${syncUserId}`
            }
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );

      return res.json({
        success: true,
        logs,
        profile: {
          firstName: dataSync.profile.name.split(' ')[0],
          lastName: dataSync.profile.name.split(' ')[1] || '',
          email: dataSync.profile.email,
          picture: dataSync.profile.picture,
          bio: dataSync.profile.bio,
          birthday: dataSync.profile.birthday
        }
      });
    }

    if (targetPlatform === 'instagram') {
      logs.push('Initiating Instagram profile sync...');
      const instagramConn = await Connection.findOne({ platform: 'instagram', userId: syncUserId });
      if (!instagramConn || !instagramConn.connected) {
        return res.status(400).json({ error: 'Instagram is not connected/toggled on.', logs });
      }

      const dataSync = await fetchInstagramProfileDetails(syncUserId);
      logs.push(`Successfully Synced Instagram Profile: ${dataSync.profile.name}`);
      logs.push(`Username: "@${dataSync.profile.username}"`);
      logs.push(`Bio: "${dataSync.profile.bio.substring(0, 60)}..."`);
      logs.push('Instagram sync sequence complete.');

      await InstagramData.findOneAndUpdate(
        { userId: syncUserId },
        {
          profile: {
            id: dataSync.profile.id,
            username: dataSync.profile.username,
            name: dataSync.profile.name,
            email: dataSync.profile.email,
            picture: dataSync.profile.picture,
            bio: dataSync.profile.bio,
            birthday: dataSync.profile.birthday
          },
          updatedAt: new Date()
        },
        { upsert: true }
      );

      await AgentData.findOneAndUpdate(
        { userId: syncUserId },
        {
          $push: {
            activityLogs: {
              timestamp: new Date(),
              platform: 'instagram',
              event: 'SYNC_COMPLETE',
              details: `Synced Instagram profile @${dataSync.profile.username} for User ${syncUserId}`
            }
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );

      return res.json({
        success: true,
        logs,
        profile: {
          firstName: dataSync.profile.name.split(' ')[0],
          lastName: dataSync.profile.name.split(' ')[1] || '',
          email: dataSync.profile.email,
          picture: dataSync.profile.picture,
          bio: dataSync.profile.bio,
          birthday: dataSync.profile.birthday
        }
      });
    }

    if (targetPlatform === 'googlephotos') {
      logs.push('Initiating Google Photos library sync...');
      const photosConn = await Connection.findOne({ platform: 'googlephotos', userId: syncUserId });
      if (!photosConn || !photosConn.connected) {
        return res.status(400).json({ error: 'Google Photos is not connected/toggled on.', logs });
      }

      const photos = await fetchGooglePhotos(syncUserId);
      logs.push(`Successfully synced Google Photos library.`);
      logs.push(`Retrieved ${photos.length} recent media items.`);
      photos.forEach((p, idx) => {
        logs.push(`[Media #${idx + 1}] ${p.filename} (${p.mimeType})`);
      });
      logs.push('Google Photos sync sequence complete.');

      await AgentData.findOneAndUpdate(
        { userId: syncUserId },
        {
          $push: {
            activityLogs: {
              timestamp: new Date(),
              platform: 'googlephotos',
              event: 'SYNC_COMPLETE',
              details: `Synced ${photos.length} Google Photos media items for User ${syncUserId}`
            }
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );

      return res.json({
        success: true,
        logs,
        profile: {
          firstName: 'Google',
          lastName: 'Photos',
          email: 'avik.bhattacharjya28@gmail.com',
          picture: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200',
          bio: 'Cloud storage library containing photos and video memory media.',
          birthday: '1998-10-28'
        }
      });
    }

    // Default Cross-post sync pipeline (fetch photo from google photos, caption with OpenAI, post to active destinations)
    logs.push('Initiating multi-platform auto-sync pipeline...');
    const photosConn = await Connection.findOne({ platform: 'googlephotos', userId: syncUserId });
    if (!photosConn || !photosConn.connected) {
      return res.status(400).json({ error: 'Google Photos is not connected. Connect Google Photos to load source images.', logs });
    }

    const photos = await fetchGooglePhotos(syncUserId);
    logs.push(`Retrieved ${photos.length} source images from Google Photos.`);
    if (photos.length === 0) {
      return res.json({ success: true, logs: [...logs, 'No photos found to sync.'] });
    }

    const targetPhoto = photos[0];
    logs.push(`Processing image: ${targetPhoto.filename}`);

    logs.push('Generating AI caption...');
    const caption = await generatePhotoCaption(targetPhoto.baseUrl);
    logs.push(`Generated Caption: "${caption}"`);

    // Only post to active social platforms
    const activePlatforms = await Connection.find({ connected: true, userId: syncUserId, platform: { $in: ['facebook', 'instagram'] } });
    if (activePlatforms.length === 0) {
      logs.push('No active destination social platforms (Facebook, Instagram) are toggled on.');
    }

    for (const p of activePlatforms) {
      try {
        logs.push(`Posting photo to ${p.platform.toUpperCase()}...`);
        if (p.platform === 'facebook') {
          const result = await postToFacebook(targetPhoto.baseUrl, caption, syncUserId);
          logs.push(`Successfully posted to Facebook (ID: ${result.postId})`);
        } else if (p.platform === 'instagram') {
          const result = await postToInstagram(targetPhoto.baseUrl, caption, syncUserId);
          logs.push(`Successfully posted to Instagram (Media ID: ${result.mediaId})`);
        }
      } catch (postErr) {
        logs.push(`Failed to post to ${p.platform.toUpperCase()}: ${postErr.message}`);
      }
    }

    logs.push('Multi-platform sync sequence complete.');
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Sync process error:', error);
    res.status(500).json({ error: error.message, logs });
  }
});

async function handleIncomingMessengerChat(senderPsid, messageText) {
  try {
    const replyText = await generateChatReply(messageText, 'Messenger User', 'facebook');
    await sendFacebookMessage(senderPsid, replyText);
    console.log(`[Facebook Messenger] Successfully sent automated reply to PSID ${senderPsid}`);
  } catch (err) {
    console.error('[Facebook Messenger] Failed to handle incoming message:', err.message);
  }
}

app.get('/api/webhook/facebook', (req, res) => {
  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || 'my_agent_verify_token_123';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Facebook Webhook] Verified successfully.');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

app.post('/api/webhook/facebook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging?.[0];
      if (webhookEvent && webhookEvent.message && !webhookEvent.message.is_echo) {
        const senderPsid = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;

        console.log(`[Facebook Webhook] Received message from PSID ${senderPsid}: "${messageText}"`);

        handleIncomingMessengerChat(senderPsid, messageText).catch(err => {
          console.error('[Facebook Webhook] Error processing Messenger chat:', err.message);
        });
      }
    }
    return res.status(200).send('EVENT_RECEIVED');
  }
  res.sendStatus(404);
});

// POST Simulating chatbot messaging incoming triggers (relying to chats)
app.post('/api/webhook/chat', async (req, res) => {
  const { platform, senderName, messageContent, recipientPhone } = req.body;
  if (!platform || !senderName || !messageContent) {
    return res.status(400).json({ error: 'Missing required parameters: platform, senderName, messageContent' });
  }

  try {
    const chatActive = await Connection.findOne({ platform, connected: true });
    if (!chatActive) {
      return res.status(400).json({ error: `${platform} is not currently toggled on for automations.` });
    }

    // Process reply via OpenAI service
    const aiReply = await generateChatReply(messageContent, senderName, platform);

    // Send reply via platform if it is WhatsApp
    if (platform === 'whatsapp') {
      const targetPhone = recipientPhone || '1234567890';
      await sendWhatsAppMessage(targetPhone, aiReply);

      await WhatsAppData.findOneAndUpdate(
        { userId: 'default_user' },
        {
          $push: {
            messageHistory: {
              sender: 'agent',
              recipient: targetPhone,
              messageText: aiReply,
              timestamp: new Date(),
              direction: 'outbound'
            }
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );

      await AgentData.findOneAndUpdate(
        { userId: 'default_user' },
        {
          $push: {
            activityLogs: {
              timestamp: new Date(),
              platform: 'whatsapp',
              event: 'MESSAGE_SENT',
              details: `Sent automated reply to WhatsApp contact ${targetPhone}`
            }
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
    }

    // Send reply via platform if it is LinkedIn
    if (platform === 'linkedin') {
      const recipientUrn = recipientPhone && recipientPhone.startsWith('urn:li:') 
        ? recipientPhone 
        : `urn:li:person:${recipientPhone || 'dummy_urn'}`;
      await sendLinkedInMessage(recipientUrn, aiReply);

      await AgentData.findOneAndUpdate(
        { userId: 'default_user' },
        {
          $push: {
            activityLogs: {
              timestamp: new Date(),
              platform: 'linkedin',
              event: 'MESSAGE_SENT',
              details: `Sent automated chat response to LinkedIn contact ${recipientUrn}`
            }
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
    }

    // Send reply via platform if it is Facebook Messenger
    if (platform === 'facebook') {
      const recipientPsid = recipientPhone || 'dummy_psid';
      await sendFacebookMessage(recipientPsid, aiReply);

      await AgentData.findOneAndUpdate(
        { userId: 'default_user' },
        {
          $push: {
            activityLogs: {
              timestamp: new Date(),
              platform: 'facebook',
              event: 'MESSAGE_SENT',
              details: `Sent automated reply to Messenger contact ${recipientPsid}`
            }
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      originalMessage: messageContent,
      reply: aiReply,
      recipient: senderName
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET Facebook data
app.get('/api/data/facebook', async (req, res) => {
  const userId = req.query.userId || 'default_user';
  try {
    const data = await FacebookData.findOne({ userId });
    res.json(data || { profile: {}, personalFeed: [], pages: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Instagram data
app.get('/api/data/instagram', async (req, res) => {
  const userId = req.query.userId || 'default_user';
  try {
    const data = await InstagramData.findOne({ userId });
    res.json(data || { profile: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET LinkedIn data
app.get('/api/data/linkedin', async (req, res) => {
  const userId = req.query.userId || 'default_user';
  try {
    const data = await LinkedInData.findOne({ userId });
    res.json(data || { profile: {}, feeds: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET WhatsApp data
app.get('/api/data/whatsapp', async (req, res) => {
  const userId = req.query.userId || 'default_user';
  try {
    const data = await WhatsAppData.findOne({ userId });
    res.json(data || { messageHistory: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Agent data
app.get('/api/data/agent', async (req, res) => {
  const userId = req.query.userId || 'default_user';
  try {
    const data = await AgentData.findOne({ userId });
    res.json(data || { activityLogs: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Clear all synced database data for a user
app.post('/api/data/clear', async (req, res) => {
  const { platform, userId } = req.body || {};
  const targetUserId = userId || 'default_user';
  if (!platform) {
    return res.status(400).json({ error: 'Platform is required.' });
  }

  try {
    if (platform === 'facebook') {
      await FacebookData.deleteOne({ userId: targetUserId });
    } else if (platform === 'instagram') {
      await InstagramData.deleteOne({ userId: targetUserId });
    } else if (platform === 'linkedin') {
      await LinkedInData.deleteOne({ userId: targetUserId });
    } else if (platform === 'whatsapp') {
      await WhatsAppData.deleteOne({ userId: targetUserId });
    } else if (platform === 'agent') {
      await AgentData.deleteOne({ userId: targetUserId });
    } else {
      return res.status(400).json({ error: 'Invalid platform.' });
    }

    console.log(`[Database Clear] Wiped all ${platform} database records for operator: ${targetUserId}`);
    res.json({ success: true, message: `Successfully cleared all ${platform} database data.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST AI Brand & Feed Analysis using Mongoose data
app.post('/api/analyze/:platform', async (req, res) => {
  const { platform } = req.params;
  const userId = req.body.userId || req.query.userId || 'default_user';
  try {
    let rawContent = '';

    if (platform === 'facebook') {
      const data = await FacebookData.findOne({ userId });
      if (!data) return res.status(404).json({ error: 'No synced Facebook data found.' });
      rawContent = JSON.stringify({ profile: data.profile, personalFeed: data.personalFeed, pages: data.pages });
    } else if (platform === 'instagram') {
      const data = await InstagramData.findOne({ userId });
      if (!data) return res.status(404).json({ error: 'No synced Instagram data found.' });
      rawContent = JSON.stringify({ profile: data.profile });
    } else if (platform === 'linkedin') {
      const data = await LinkedInData.findOne({ userId });
      if (!data) return res.status(404).json({ error: 'No synced LinkedIn data found.' });
      rawContent = JSON.stringify({ profile: data.profile, feeds: data.feeds });
    } else {
      return res.status(400).json({ error: 'Invalid platform for analysis' });
    }

    const prompt = `You are an expert Social Media Brand Strategist. Analyze the following real synced profile and feed data from ${platform.toUpperCase()}:\n\n${rawContent}\n\nProvide: 1. A summary of the user's digital footprint. 2. A 3-bullet content optimization report. 3. Suggested post ideas for next week. Keep it concise, professional, and highly actionable.`;
    const response = await generateChatReply(prompt, 'Developer', platform);

    res.json({ success: true, analysis: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});

