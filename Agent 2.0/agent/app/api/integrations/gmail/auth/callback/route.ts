import { NextResponse } from "next/server";
import { google } from "googleapis";
import { insforge } from "@/lib/insforge";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/api/integrations/gmail/auth/callback";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const userId = searchParams.get("state");

    if (!code) {
      return NextResponse.redirect("http://localhost:3000/dashboard?gmail_error=missing_code");
    }

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    const { tokens } = await oauth2Client.getToken(code);

    if (userId) {
      const connectionId = `${userId}_gmail`;
      await insforge.database
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
    }

    return NextResponse.redirect("http://localhost:3000/dashboard?gmail_connected=true");
  } catch (err: any) {
    console.error("OAuth Callback Error:", err);
    return NextResponse.redirect("http://localhost:3000/dashboard?gmail_error=auth_failed");
  }
}
