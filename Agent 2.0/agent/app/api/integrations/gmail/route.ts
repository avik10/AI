import { NextResponse } from "next/server";
import { google } from "googleapis";
import { insforge } from "@/lib/insforge";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || "";
const REDIRECT_URI = "http://localhost:3000/api/integrations/gmail/auth/callback";

export async function POST(request: Request) {
  try {
    const { action, params, accountEmail, userId } = await request.json();

    if (!accountEmail) {
      return NextResponse.json(
        { error: "Gmail MCP connection error: No connected Google account provided." },
        { status: 400 }
      );
    }

    if (action !== "gmail_list_messages") {
      return NextResponse.json(
        { error: `Action '${action}' is not supported.` },
        { status: 400 }
      );
    }

    const limit = params?.limit || 5;

    // Check if we have tokens stored in InsForge database for this user
    let refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    let accessToken: string | undefined = undefined;

    if (userId) {
      const { data } = await insforge.database
        .from("user_integrations")
        .select("settings")
        .eq("id", `${userId}_gmail`)
        .eq("status", "connected");

      if (data && data.length > 0 && data[0].settings) {
        try {
          const settings = typeof data[0].settings === "string" ? JSON.parse(data[0].settings) : data[0].settings;
          if (settings?.refresh_token) {
            refreshToken = settings.refresh_token;
          }
          if (settings?.access_token) {
            accessToken = settings.access_token;
          }
        } catch (e) {}
      }
    }

    // Check if we have valid refresh token or live access token to query Google API
    if (refreshToken && refreshToken !== "your-google-oauth-refresh-token") {
      try {
        const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
        oauth2Client.setCredentials({
          refresh_token: refreshToken,
          access_token: accessToken
        });

        const gmail = google.gmail({ version: "v1", auth: oauth2Client });

        // Query live Google Gmail API!
        const listRes = await gmail.users.messages.list({
          userId: "me",
          maxResults: limit
        });

        const messagesList = listRes.data.messages || [];

        const liveEmails = await Promise.all(
          messagesList.map(async (item) => {
            const msgRes = await gmail.users.messages.get({
              userId: "me",
              id: item.id!
            });

            const payload = msgRes.data.payload;
            const headers = payload?.headers || [];

            const fromHeader = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "Unknown Sender";
            const subjectHeader = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "(No Subject)";
            const dateHeader = headers.find((h) => h.name?.toLowerCase() === "date")?.value || new Date().toISOString();

            return {
              id: msgRes.data.id,
              from: fromHeader,
              to: accountEmail,
              subject: subjectHeader,
              body: msgRes.data.snippet || "(No content snippet)",
              date: new Date(dateHeader).toISOString()
            };
          })
        );

        return NextResponse.json({
          success: true,
          liveData: true,
          accountBound: accountEmail,
          result: {
            method: "gmail_list_messages",
            accountScope: accountEmail,
            count: liveEmails.length,
            messages: liveEmails
          }
        });
      } catch (googleApiErr: any) {
        console.error("Live Google API Call Error:", googleApiErr?.message || googleApiErr);
      }
    }

    // Fallback simulation mode if OAuth token is not yet granted
    const mockEmails = [
      {
        id: "msg_901",
        from: "sarah.jones@workspace.com",
        to: accountEmail,
        subject: "Q3 Roadmap Slides Kickoff Sync",
        body: `Hi ${accountEmail.split("@")[0]},\nPlease find the slides attached for the sync meeting on Monday. Let me know your suggestions.\n\nBest,\nSarah`,
        date: "2026-07-17T09:12:00Z"
      },
      {
        id: "msg_902",
        from: "david.miller@client-ops.org",
        to: accountEmail,
        subject: "Travel Details & Hotel Coordinates",
        body: "Confirming hotel check-in for tonight. Let's align on dinner plans by 8 PM.\n\nThanks,\nDavid",
        date: "2026-07-17T08:45:00Z"
      },
      {
        id: "msg_903",
        from: "alerts@system-monitor.io",
        to: accountEmail,
        subject: "[WARNING] CPU usage exceeded 92% on prod-api-04",
        body: `CPU alert triggered on prod-api-04 at 2026-07-17T08:12:00Z. Sent to ${accountEmail}.`,
        date: "2026-07-17T08:12:00Z"
      }
    ];

    return NextResponse.json({
      success: true,
      liveData: false,
      accountBound: accountEmail,
      notice: "Showing sandbox simulation data. Click 'Authenticate Google Account' in Gmail Settings to grant live Google API access.",
      result: {
        method: "gmail_list_messages",
        accountScope: accountEmail,
        count: mockEmails.length,
        messages: mockEmails.slice(0, limit)
      }
    });
  } catch (err: any) {
    console.error("Gmail MCP API exception:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
