import { NextResponse } from "next/server";
import { google } from "googleapis";
import { insforge } from "@/lib/insforge";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || "";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = url.origin;
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state");

    const redirectUri = `${origin}/api/integrations/gmail/auth/callback`;

    if (!code) {
      return NextResponse.redirect(`${origin}/dashboard?gmail_error=missing_code`);
    }

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    if (userId && userId !== "undefined") {
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

    return NextResponse.redirect(`${origin}/dashboard?gmail_connected=true`);
  } catch (err: any) {
    console.error("OAuth Callback Error:", err);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/dashboard?gmail_error=auth_failed`);
  }
}
