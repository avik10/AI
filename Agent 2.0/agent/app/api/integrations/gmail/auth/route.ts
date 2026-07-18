import { NextResponse } from "next/server";
import { google } from "googleapis";
import { insforge } from "@/lib/insforge";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/api/integrations/gmail/auth/callback";

function getOAuth2Client() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

// GET: Returns the Google OAuth authorization URL
export async function GET(request: Request) {
  try {
    const oauth2Client = getOAuth2Client();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "";

    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email"
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes,
      state: userId
    });

    return NextResponse.json({ success: true, url });
  } catch (err: any) {
    console.error("Error generating OAuth URL:", err);
    return NextResponse.json({ error: err.message || "Failed to generate Auth URL" }, { status: 500 });
  }
}

// POST: Exchange code for tokens & store in InsForge database
export async function POST(request: Request) {
  try {
    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json({ error: "Authorization code and userId are required." }, { status: 400 });
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const connectionId = `${userId}_gmail`;

    // Save tokens in InsForge database user_integrations table
    const { error } = await insforge.database
      .from("user_integrations")
      .upsert([
        {
          id: connectionId,
          user_id: userId,
          platform: "gmail",
          status: "connected",
          connected_at: new Date().toISOString(),
          settings: JSON.stringify({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expiry_date: tokens.expiry_date
          })
        }
      ]);

    if (error) {
      console.error("InsForge token storage error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Gmail account successfully authorized and bound to MCP!" });
  } catch (err: any) {
    console.error("Error exchanging OAuth code:", err);
    return NextResponse.json({ error: err.message || "OAuth exchange failed." }, { status: 500 });
  }
}
