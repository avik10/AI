import { NextResponse } from "next/server";
import { callGeminiAi } from "@/lib/gemini";
import { insforge } from "@/lib/insforge";
import fs from "fs";
import path from "path";

// Load MCP Server Definitions from .gemini/settings.json if available
function getRegisteredMcpServers() {
  try {
    const settingsPath = path.join(process.cwd(), ".gemini", "settings.json");
    if (fs.existsSync(settingsPath)) {
      const content = fs.readFileSync(settingsPath, "utf-8");
      const parsed = JSON.parse(content);
      return parsed.mcpServers || {};
    }
  } catch (e) {
    console.warn("Could not read .gemini/settings.json:", e);
  }
  return {};
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, userId, context, action, phone, contactName, summary } = body;

    if (!userId) {
      return NextResponse.json({ error: "Parameter 'userId' is required." }, { status: 400 });
    }

    // Handle Gemini WhatsApp AI Reply draft generation based on AI Summary
    if (action === "gemini_whatsapp_auto_reply" || action === "copilot_whatsapp_auto_reply") {
      const contact = contactName || phone || "Friend";

      const systemPrompt = `You are Google Gemini AI assistant for WhatsApp. Generate a concise, polite, natural human-like reply to ${contact} based on the following incoming message summary:\n\n${summary}\n\nKeep the response under 2-3 sentences.`;

      const geminiReply = await callGeminiAi(`Generate WhatsApp reply to ${contact}`, systemPrompt);

      let autoReplyText = geminiReply || "";

      if (!autoReplyText) {
        const lower = String(summary || "").toLowerCase();
        if (lower.includes("meet") || lower.includes("schedule") || lower.includes("time") || lower.includes("call") || lower.includes("zoom")) {
          autoReplyText = `Hi ${contact}, thank you for reaching out! I received your meeting request. Let me check my calendar and I will get back to you with a convenient time slot.`;
        } else if (lower.includes("report") || lower.includes("doc") || lower.includes("send") || lower.includes("file") || lower.includes("pdf")) {
          autoReplyText = `Hi ${contact}, thanks for your message! I am preparing the requested documents/reports and will send them over to you shortly.`;
        } else if (lower.includes("urgent") || lower.includes("asap") || lower.includes("important") || lower.includes("help")) {
          autoReplyText = `Hi ${contact}, I saw your urgent message. I am prioritizing your request and will follow up with you right away!`;
        } else {
          autoReplyText = `Hi ${contact}, thank you for reaching out regarding your update. I've reviewed your message and will follow up with you shortly!`;
        }
      }

      const logId = `gemini_wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      try {
        await insforge.database.from("agent_logs").insert([
          {
            id: logId,
            user_id: userId,
            prompt: `Gemini AI WhatsApp Reply to ${contact} (${phone})`,
            tool_called: "gemini_whatsapp_reply",
            result_summary: `Generated reply: "${autoReplyText}"`
          }
        ]);
      } catch (e) {}

      return NextResponse.json({
        success: true,
        autoReplyText,
        contact,
        phone
      });
    }

    const mcpServers = getRegisteredMcpServers();
    
    // System Instruction exposing MCP Tool Servers & Native Capabilities to Gemini Context
    const systemInstruction = `You are OmniSync Gemini Agent powered by Google Gemini AI and Model Context Protocol (MCP).
You have access to registered MCP Servers: ${Object.keys(mcpServers).join(", ")}.
Analyze user requests, synthesize replies for WhatsApp, Gmail, and LinkedIn, and provide helpful responses.`;

    const fullPrompt = `${context ? "Context: " + JSON.stringify(context) + "\n\n" : ""}User Request: ${prompt}`;

    const geminiText = await callGeminiAi(fullPrompt, systemInstruction);

    const responseText = geminiText || `I processed your request: "${prompt}". OmniSync Gemini Agent monitored active MCP tools (${Object.keys(mcpServers).join(", ")}).`;

    // Telemetry log to PostgreSQL agent_logs table
    const logId = `gemini_mcp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await insforge.database.from("agent_logs").insert([
        {
          id: logId,
          user_id: userId,
          prompt,
          tool_called: "gemini_mcp_handler",
          result_summary: responseText
        }
      ]);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      agent: "OmniSync Gemini Agent",
      mcpServers: Object.keys(mcpServers),
      response: responseText,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Gemini Route Handler Error:", err);
    return NextResponse.json({ error: err.message || "Gemini route execution failed" }, { status: 500 });
  }
}

export async function GET() {
  const mcpServers = getRegisteredMcpServers();
  return NextResponse.json({
    status: "active",
    agent: "OmniSync Gemini Agent",
    mcpServers,
    registeredCount: Object.keys(mcpServers).length
  });
}
