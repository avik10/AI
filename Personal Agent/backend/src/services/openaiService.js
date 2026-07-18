const { OpenAI } = require('openai');
const Connection = require('../models/Connection');

/**
 * Helper to fetch dynamic OpenAI client using database credentials.
 * If credentials are not present, returns null so we fallback to Simulator mode.
 */
async function getOpenAIClient() {
  const conn = await Connection.findOne({ platform: 'openai' });
  if (conn && conn.connected && conn.credentials.apiKey) {
    return new OpenAI({
      apiKey: conn.credentials.apiKey,
    });
  }
  return null;
}

/**
 * Generate automated chat replies.
 */
async function generateChatReply(messageContent, senderName, platform) {
  const openai = await getOpenAIClient();
  if (!openai) {
    // Simulator Mode
    return `[AI Simulator Reply] Hi ${senderName}! Thanks for your message on ${platform}. We received: "${messageContent}". How can I help you today?`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful social media assistant. Respond politely to direct messages on ${platform}. Keep it concise and professional.`
        },
        {
          role: 'user',
          content: `Message from ${senderName}: "${messageContent}"`
        }
      ],
      max_tokens: 150
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating reply from OpenAI:', error.message);
    return `Hi ${senderName}, thanks for reaching out. I'll get back to you shortly! (AI reply failed: ${error.message})`;
  }
}

/**
 * Generate photo description/caption for Google Photos images.
 */
async function generatePhotoCaption(imageUrl) {
  const openai = await getOpenAIClient();
  if (!openai) {
    // Simulator Mode
    return `[AI Simulator Caption] Capturing beautiful moments! ✨ 📸 #GooglePhotos #Automated`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Write a catchy, engaging social media caption with a few hashtags for this image.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 100
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating photo caption from OpenAI:', error.message);
    return `A picture is worth a thousand words! 📸 #Memories #Sync`;
  }
}

module.exports = {
  generateChatReply,
  generatePhotoCaption
};

