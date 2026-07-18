const axios = require('axios');
const Connection = require('../models/Connection');

// Retrieve credential configuration helper
async function getPlatformCredentials(platform, userId = 'default_user') {
  const conn = await Connection.findOne({ platform, userId });
  if (conn && conn.connected) {
    return conn.credentials;
  }
  return null;
}

/**
 * Google Photos Service
 */
async function fetchGooglePhotos(userId = 'default_user') {
  const creds = await getPlatformCredentials('googlephotos', userId);
  if (!creds || !creds.accessToken) {
    console.log('[Google Photos] Simulator mode: Fetching sample photos.');
    // Simulated Google Photos payload
    return [
      {
        id: 'photo_sim_1',
        baseUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
        filename: 'yosemite_valley.jpg',
        mimeType: 'image/jpeg'
      },
      {
        id: 'photo_sim_2',
        baseUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
        filename: 'forest_mist.jpg',
        mimeType: 'image/jpeg'
      }
    ];
  }

  try {
    const isApiKey = creds.accessToken.startsWith('AIzaSy');
    const config = {
      params: {
        pageSize: 5
      }
    };

    if (isApiKey) {
      config.params.key = creds.accessToken;
    } else {
      config.headers = {
        Authorization: `Bearer ${creds.accessToken}`
      };
    }

    const response = await axios.get('https://photoslibrary.googleapis.com/v1/mediaItems', config);
    return response.data.mediaItems || [];
  } catch (error) {
    console.error('Error fetching Google Photos:', error.response?.data || error.message);
    throw new Error('Google Photos API failure: ' + (error.response?.data?.error?.message || error.message));
  }
}

/**
 * Facebook Graph API Integration
 */
async function postToFacebook(imageUrl, caption, userId = 'default_user') {
  const creds = await getPlatformCredentials('facebook', userId);
  if (!creds || !creds.accessToken) {
    console.log('[Facebook] Simulator mode: Posting completed successfully.');
    return { success: true, postId: 'fb_sim_' + Math.random().toString(36).substr(2, 9) };
  }

  try {
    // Meta Graph API post photo to page or user timeline
    const response = await axios.post(
      `https://graph.facebook.com/me/photos`,
      {
        url: imageUrl,
        message: caption
      },
      {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`
        }
      }
    );
    return { success: true, postId: response.data.id || response.data.post_id };
  } catch (error) {
    console.error('Error posting to Facebook:', error.response?.data || error.message);
    throw new Error('Facebook API failure: ' + (error.response?.data?.error?.message || error.message));
  }
}

/**
 * Instagram Graph API Integration
 */
async function postToInstagram(imageUrl, caption, userId = 'default_user') {
  const creds = await getPlatformCredentials('instagram', userId);
  if (!creds || !creds.accessToken) {
    console.log('[Instagram] Simulator mode: Posting completed successfully.');
    return { success: true, mediaId: 'ig_sim_' + Math.random().toString(36).substr(2, 9) };
  }

  try {
    // 1. Create Media Container
    const containerRes = await axios.post(
      `https://graph.facebook.com/v25.0/me/media`,
      {
        image_url: imageUrl,
        caption: caption
      },
      {
        headers: { Authorization: `Bearer ${creds.accessToken}` }
      }
    );
    const creationId = containerRes.data.id;

    // 2. Publish Container
    const publishRes = await axios.post(
      `https://graph.facebook.com/v25.0/me/media_publish`,
      {
        creation_id: creationId
      },
      {
        headers: { Authorization: `Bearer ${creds.accessToken}` }
      }
    );
    return { success: true, mediaId: publishRes.data.id };
  } catch (error) {
    console.error('Error posting to Instagram:', error.response?.data || error.message);
    throw new Error('Instagram API failure: ' + (error.response?.data?.error?.message || error.message));
  }
}

/**
 * LinkedIn UGC Share API
 */
async function postToLinkedIn(imageUrl, caption, userId = 'default_user') {
  const creds = await getPlatformCredentials('linkedin', userId);
  if (!creds || !creds.accessToken) {
    console.log('[LinkedIn] Simulator mode: Post shared successfully.');
    return { success: true, urn: 'urn:li:share:sim_' + Math.random().toString(36).substr(2, 9) };
  }

  try {
    // Get member's Person URN dynamically from userinfo
    const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${creds.accessToken}` }
    });
    const personUrn = `urn:li:person:${profileRes.data.sub}`;

    // 1. Fetch image binary buffer from source URL
    let imageBuffer = null;
    try {
      const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      imageBuffer = imgRes.data;
    } catch (imgErr) {
      console.warn('[LinkedIn] Failed to fetch source image binary, falling back to text post:', imgErr.message);
    }

    let mediaAssetUrn = null;
    if (imageBuffer) {
      // 2. Register upload request
      const registerRes = await axios.post(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: personUrn,
            supportedUploadMechanisms: ['SYNCHRONOUS_UPLOAD']
          }
        },
        {
          headers: {
            Authorization: `Bearer ${creds.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      const uploadUrl = registerRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      mediaAssetUrn = registerRes.data.value.asset;

      // 3. Upload image binary buffer to uploadUrl
      await axios.put(uploadUrl, imageBuffer, {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'image/jpeg'
        }
      });
    }

    // 4. Create UGC Post
    const postPayload = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: caption
          },
          shareMediaCategory: mediaAssetUrn ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    if (mediaAssetUrn) {
      postPayload.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          description: { text: 'Automated Agent Share' },
          media: mediaAssetUrn,
          title: { text: 'Synced Photo' }
        }
      ];
    }

    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postPayload,
      {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
    return { success: true, urn: response.data.id };
  } catch (error) {
    console.error('Error posting to LinkedIn:', error.response?.data || error.message);
    throw new Error('LinkedIn API failure: ' + (error.response?.data?.message || error.message));
  }
}

/**
 * WhatsApp Cloud API Integration
 */
async function sendWhatsAppMessage(recipientPhone, message, userId = 'default_user') {
  const creds = await getPlatformCredentials('whatsapp', userId);
  if (!creds || !creds.accessToken || !creds.phoneNumberId) {
    console.log('[WhatsApp] Simulator mode: Message dispatched successfully.');
    return { success: true, messageId: 'wa_sim_' + Math.random().toString(36).substr(2, 9) };
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${creds.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true, messageId: response.data.messages[0].id };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    throw new Error('WhatsApp API failure: ' + (error.response?.data?.error?.message || error.message));
  }
}

async function fetchLinkedInProfileAndFeeds(userId = 'default_user') {
  const creds = await getPlatformCredentials('linkedin', userId);
  if (!creds || !creds.accessToken || creds.accessToken.startsWith('sim_')) {
    throw new Error('OAuth credentials missing. Please connect your LinkedIn account to sync real data.');
  }

  try {
    const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${creds.accessToken}`
      }
    });

    let feeds = [];
    try {
      const feedsRes = await axios.get('https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:person:' + profileRes.data.sub, {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      feeds = feedsRes.data.elements || [];
    } catch (feedErr) {
      console.warn('[LinkedIn] Failed to fetch shares directly (r_member_social scope missing):', feedErr.message);
      feeds = [];
    }

    return {
      profile: {
        id: profileRes.data.sub,
        firstName: profileRes.data.given_name,
        lastName: profileRes.data.family_name,
        profilePictureUrl: profileRes.data.picture || '',
        headline: 'LinkedIn Member'
      },
      feeds
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile & feeds:', error.response?.data || error.message);
    throw new Error('LinkedIn Profile API failure: ' + (error.response?.data?.error?.message || error.message));
  }
}

async function sendLinkedInMessage(recipientUrn, message, userId = 'default_user') {
  const creds = await getPlatformCredentials('linkedin', userId);
  if (!creds || !creds.accessToken || creds.accessToken.startsWith('sim_')) {
    console.log(`[LinkedIn Messaging] Simulator mode: Message dispatched to ${recipientUrn}`);
    return { success: true, messageId: 'msg_sim_' + Math.random().toString(36).substr(2, 9) };
  }

  try {
    const response = await axios.post(
      'https://api.linkedin.com/v2/messages',
      {
        recipients: [recipientUrn],
        messageBody: {
          text: message
        }
      },
      {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.error('Error sending LinkedIn message:', error.response?.data || error.message);
    throw new Error('LinkedIn Messaging API failure: ' + (error.response?.data?.message || error.message));
  }
}

async function fetchFacebookProfileAndPages(userId = 'default_user') {
  const creds = await getPlatformCredentials('facebook', userId);
  if (!creds || !creds.accessToken || creds.accessToken.startsWith('sim_')) {
    throw new Error('OAuth credentials missing. Please connect your Facebook account to sync real data.');
  }

  try {
    const profileRes = await axios.get('https://graph.facebook.com/v25.0/me', {
      params: {
        fields: 'id,name,email,birthday,about,feed',
        access_token: creds.accessToken
      }
    });

    let pictureUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200';
    try {
      const picRes = await axios.get(`https://graph.facebook.com/v25.0/me/picture`, {
        params: {
          redirect: false,
          type: 'large',
          access_token: creds.accessToken
        }
      });
      if (picRes.data && picRes.data.data && picRes.data.data.url) {
        pictureUrl = picRes.data.data.url;
      }
    } catch (picErr) {
      console.warn('[Facebook] Failed to fetch real profile picture:', picErr.message);
    }

    const personalFeed = profileRes.data.feed?.data || [];

    const accountsRes = await axios.get('https://graph.facebook.com/v25.0/me/accounts', {
      params: {
        access_token: creds.accessToken
      }
    });
    const rawPages = accountsRes.data.data || [];

    const pages = [];
    for (const page of rawPages) {
      let posts = [];
      try {
        const feedRes = await axios.get(`https://graph.facebook.com/v25.0/${page.id}/feed`, {
          params: {
            fields: 'id,message,created_time',
            limit: 5,
            access_token: page.access_token
          }
        });
        posts = feedRes.data.data || [];
      } catch (feedErr) {
        console.warn(`[Facebook] Failed to fetch feed for page ${page.name}:`, feedErr.message);
      }

      pages.push({
        id: page.id,
        name: page.name,
        category: page.category || 'General',
        posts
      });
    }

    return {
      profile: {
        id: profileRes.data.id,
        name: profileRes.data.name,
        email: profileRes.data.email || 'avik.bhattacharjya28@gmail.com',
        picture: pictureUrl,
        bio: profileRes.data.about || 'Building intelligent AI cross-platform automation suites.',
        birthday: profileRes.data.birthday || '1998-10-28'
      },
      personalFeed,
      pages
    };
  } catch (error) {
    console.error('Error fetching Facebook profile & pages:', error.response?.data || error.message);
    throw new Error('Facebook Graph API failure: ' + (error.response?.data?.error?.message || error.message));
  }
}

async function fetchInstagramProfileDetails(userId = 'default_user') {
  const creds = await getPlatformCredentials('instagram', userId);
  if (!creds || !creds.accessToken || creds.accessToken.startsWith('sim_')) {
    throw new Error('OAuth credentials missing. Please connect your Instagram account to sync real data.');
  }

  try {
    let email = 'avik.bhattacharjya28@gmail.com';
    try {
      const fbMe = await axios.get('https://graph.facebook.com/v25.0/me', {
        params: { fields: 'id,name,email', access_token: creds.accessToken }
      });
      if (fbMe.data && fbMe.data.email) {
        email = fbMe.data.email;
      }
    } catch (fbMeErr) {
      console.warn('[Instagram Sync] Failed to retrieve basic Facebook profile email fallback:', fbMeErr.message);
    }

    const accountsRes = await axios.get('https://graph.facebook.com/v25.0/me/accounts', {
      params: {
        fields: 'instagram_business_account,name,access_token',
        access_token: creds.accessToken
      }
    });

    const pages = accountsRes.data.data || [];
    if (pages.length === 0) {
      throw new Error('Instagram Graph API failure: No Facebook Pages found linked to this account. Instagram Business accounts require a linked Facebook Page.');
    }

    let igAccountId = null;
    let pageAccessToken = null;
    for (const page of pages) {
      if (page.instagram_business_account) {
        igAccountId = page.instagram_business_account.id;
        pageAccessToken = page.access_token || creds.accessToken;
        break;
      }
    }

    if (!igAccountId) {
      throw new Error('Instagram Graph API failure: No connected Instagram Business Account found linked to your Facebook Page.');
    }

    const igRes = await axios.get(`https://graph.facebook.com/v25.0/${igAccountId}`, {
      params: {
        fields: 'id,username,name,profile_picture_url,biography,website,media_count,followers_count,follows_count',
        access_token: pageAccessToken
      }
    });

    return {
      profile: {
        id: igRes.data.id,
        username: igRes.data.username,
        name: igRes.data.name || igRes.data.username,
        email: email,
        picture: igRes.data.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        bio: igRes.data.biography || 'Instagram Creator profile active.',
        birthday: '1998-10-28',
        website: igRes.data.website || '',
        mediaCount: igRes.data.media_count || 0,
        followersCount: igRes.data.followers_count || 0,
        followsCount: igRes.data.follows_count || 0
      }
    };
  } catch (error) {
    console.error('Error fetching Instagram profile details:', error.response?.data || error.message);
    throw new Error('Instagram Graph API failure: ' + (error.response?.data?.error?.message || error.message));
  }
}

async function sendFacebookMessage(recipientPsid, message, userId = 'default_user') {
  const creds = await getPlatformCredentials('facebook', userId);
  if (!creds || !creds.accessToken || creds.accessToken.startsWith('sim_')) {
    console.log('[Facebook Messenger] Simulator mode: Message sent successfully.');
    return { success: true, messageId: 'fb_msg_sim_' + Math.random().toString(36).substr(2, 9) };
  }

  try {
    const accountsRes = await axios.get('https://graph.facebook.com/v25.0/me/accounts', {
      params: { access_token: creds.accessToken }
    });
    const pages = accountsRes.data.data || [];
    if (pages.length === 0) {
      throw new Error('No Facebook Pages found linked to this account. Messenger API requires a Facebook Page.');
    }

    const page = pages[0];
    const pageAccessToken = page.access_token;

    const response = await axios.post(
      `https://graph.facebook.com/v25.0/me/messages`,
      {
        recipient: { id: recipientPsid },
        message: { text: message }
      },
      {
        params: { access_token: pageAccessToken }
      }
    );

    return { success: true, messageId: response.data.message_id };
  } catch (error) {
    console.error('Error sending Facebook Messenger message:', error.response?.data || error.message);
    throw new Error('Facebook Messenger API failure: ' + (error.response?.data?.error?.message || error.message));
  }
}

module.exports = {
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
};
