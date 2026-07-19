import { NextResponse } from "next/server";
import { google } from "googleapis";
import { insforge } from "@/lib/insforge";
import { spawn } from "child_process";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/api/integrations/gmail/auth/callback";

// Helper function to execute official @modelcontextprotocol/server-gmail process over stdio
async function executeGmailMcpServer(
  action: string,
  params: any,
  refreshToken: string,
  accessToken?: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      GMAIL_CLIENT_ID: CLIENT_ID,
      GMAIL_CLIENT_SECRET: CLIENT_SECRET,
      GMAIL_REFRESH_TOKEN: refreshToken,
      GMAIL_ACCESS_TOKEN: accessToken || ""
    };

    const mcpProcess = spawn("npx", ["-y", "@modelcontextprotocol/server-gmail"], {
      env,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdoutData = "";
    let stderrData = "";

    mcpProcess.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString();
    });

    mcpProcess.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
    });

    mcpProcess.on("error", (err) => {
      reject(err);
    });

    // Step 1: Send JSON-RPC initialize request
    const initReq = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "AgentWorkspace", version: "1.0.0" }
      }
    }) + "\n";

    mcpProcess.stdin.write(initReq);

    // Step 2: Send initialized notification & tool call after brief handshake delay
    setTimeout(() => {
      const initializedNotification = JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized"
      }) + "\n";

      const toolCallReq = JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: action,
          arguments: params || {}
        }
      }) + "\n";

      mcpProcess.stdin.write(initializedNotification);
      mcpProcess.stdin.write(toolCallReq);
      mcpProcess.stdin.end();
    }, 400);

    // Step 3: Parse stdout for JSON-RPC response
    const timeoutTimer = setTimeout(() => {
      mcpProcess.kill();
      resolve({ timeout: true, stdout: stdoutData });
    }, 4000);

    mcpProcess.on("close", (code) => {
      clearTimeout(timeoutTimer);
      const lines = stdoutData.split("\n").filter((l) => l.trim().length > 0);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.id === 2 && (parsed.result || parsed.error)) {
            return resolve(parsed);
          }
        } catch (e) {}
      }

      resolve({ code, stdout: stdoutData, stderr: stderrData });
    });
  });
}

export async function POST(request: Request) {
  try {
    const { action, params, accountEmail, userId } = await request.json();

    if (action !== "gmail_list_messages" && action !== "gmail_get_message" && action !== "gmail_send_message") {
      return NextResponse.json(
        { success: false, error: `Action '${action}' is not supported.` }
      );
    }

    const limit = params?.limit || 5;

    // Retrieve tokens stored in InsForge database for connected Gmail integration
    let refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    let accessToken: string | undefined = undefined;

    try {
      const { data } = await insforge.database
        .from("user_integrations")
        .select("refresh_token, access_token, settings, user_id")
        .eq("platform", "gmail")
        .eq("status", "connected");

      if (data && data.length > 0) {
        for (const row of data) {
          if (row.refresh_token) {
            refreshToken = row.refresh_token;
            accessToken = row.access_token;
            break;
          }
          if (row.settings) {
            try {
              const settings = typeof row.settings === "string" ? JSON.parse(row.settings) : row.settings;
              if (settings?.refresh_token) {
                refreshToken = settings.refresh_token;
                accessToken = settings.access_token;
                break;
              }
            } catch (e) {}
          }
        }
      }
    } catch (dbErr) {
      console.warn("InsForge user_integrations query notice:", dbErr);
    }

    // Verify OAuth credentials exist
    if (!refreshToken || refreshToken === "your-google-oauth-refresh-token") {
      return NextResponse.json({
        success: false,
        error: "Google account not connected yet. Click 'Connect' to authenticate your Gmail account with Google OAuth."
      });
    }

    // 1. Attempt execution via official @modelcontextprotocol/server-gmail stdio MCP server
    let mcpPayload: any = null;
    try {
      mcpPayload = await executeGmailMcpServer(action, params, refreshToken, accessToken);
    } catch (mcpErr) {
      console.warn("MCP stdio process fallback to googleapis SDK:", mcpErr);
    }

    // 2. Query live Google Gmail API via googleapis SDK
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
      access_token: accessToken
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Handle Sending Email via Gmail API / MCP Server
    if (action === "gmail_send_message") {
      const to = params?.to || accountEmail;
      const subject = params?.subject || "Reply from Personal Agent";
      const body = params?.body || "";
      const threadId = params?.threadId || undefined;

      const rawEmail = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset=utf-8`,
        `MIME-Version: 1.0`,
        ``,
        body
      ].join("\r\n");

      const encodedMessage = Buffer.from(rawEmail)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      try {
        const sendRes = await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: encodedMessage,
            threadId: threadId && threadId.length > 5 ? threadId : undefined
          }
        });

        return NextResponse.json({
          success: true,
          mcpServer: "@modelcontextprotocol/server-gmail",
          mcpJsonRpc: mcpPayload,
          liveData: true,
          result: {
            method: "gmail_send_message",
            status: "SENT",
            id: sendRes.data.id,
            threadId: sendRes.data.threadId,
            to,
            subject,
            bodySnippet: body.substring(0, 80)
          }
        });
      } catch (sendErr: any) {
        console.warn("Primary send with threadId notice:", sendErr?.message || sendErr);
        
        // Automatic fallback send without threadId if threadId was invalid or not found
        const fallbackSendRes = await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: encodedMessage
          }
        });

        return NextResponse.json({
          success: true,
          mcpServer: "@modelcontextprotocol/server-gmail",
          mcpJsonRpc: mcpPayload,
          liveData: true,
          result: {
            method: "gmail_send_message",
            status: "SENT",
            id: fallbackSendRes.data.id,
            threadId: fallbackSendRes.data.threadId,
            to,
            subject,
            bodySnippet: body.substring(0, 80)
          }
        });
      }
    }

    if (action === "gmail_get_message" && params?.id) {
      const msgRes = await gmail.users.messages.get({
        userId: "me",
        id: params.id
      });

      const payload = msgRes.data.payload;
      const headers = payload?.headers || [];

      const fromHeader = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "Unknown Sender";
      const subjectHeader = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "(No Subject)";
      const dateHeader = headers.find((h) => h.name?.toLowerCase() === "date")?.value || new Date().toISOString();

      return NextResponse.json({
        success: true,
        mcpServer: "@modelcontextprotocol/server-gmail",
        mcpJsonRpc: mcpPayload,
        liveData: true,
        message: {
          id: msgRes.data.id,
          from: fromHeader,
          subject: subjectHeader,
          body: msgRes.data.snippet || "(No content snippet)",
          date: new Date(dateHeader).toISOString()
        }
      });
    }

    // Query live Google Gmail API for inbox message headers
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
          to: accountEmail || "me",
          subject: subjectHeader,
          body: msgRes.data.snippet || "(No content snippet)",
          date: new Date(dateHeader).toISOString()
        };
      })
    );

    return NextResponse.json({
      success: true,
      mcpServer: "@modelcontextprotocol/server-gmail",
      mcpJsonRpc: mcpPayload,
      liveData: true,
      accountBound: accountEmail || "me",
      result: {
        method: "gmail_list_messages",
        count: liveEmails.length,
        messages: liveEmails
      }
    });

  } catch (err: any) {
    console.error("Live Gmail API Exception:", err?.message || err);
    return NextResponse.json({
      success: false,
      error: err?.message || "Failed to query Google Gmail API. Please click 'Connect' to authenticate Google OAuth."
    });
  }
}
