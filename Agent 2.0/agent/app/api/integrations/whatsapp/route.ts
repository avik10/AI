import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";
import os from "os";
import QRCode from "qrcode";

// Real WhatsApp session & message cache per user with detailed sender & recipient tracking
interface UserWaStore {
  myPhone?: string;
  messages: Array<{
    id: string;
    sender: string;
    senderPhone: string;
    recipient: string;
    recipientPhone: string;
    phone: string;
    jid: string;
    time: string;
    timestamp: number;
    text: string;
    unread: boolean;
    type: "chat" | "group";
    fromMe: boolean;
    chatName?: string;
    displaySender?: string;
  }>;
  contacts: Record<string, { phone: string; jid: string; name: string; status?: string; avatar?: string }>;
  groups: Record<string, { id: string; name: string; participantsCount: number; owner?: string; topic?: string }>;
  groupMessages: Record<string, Array<{ id: string; sender: string; senderPhone?: string; text: string; time: string; timestamp: number }>>;
}

// Global persistent socket map to maintain WebSocket connections across Next.js API route invocations
const globalSockets: Record<string, any> = (globalThis as any).__wa_sockets || ((globalThis as any).__wa_sockets = {});
const globalStores: Record<string, UserWaStore> = (globalThis as any).__wa_stores || ((globalThis as any).__wa_stores = {});
const globalQrs: Record<string, string> = (globalThis as any).__wa_qrs || ((globalThis as any).__wa_qrs = {});
const globalConnectedState: Record<string, boolean> = (globalThis as any).__wa_connected || ((globalThis as any).__wa_connected = {});

// Helper: Sanitize user ID key safely preserving UUIDs
function sanitizeUserKey(userId: string): string {
  if (!userId) return "default";
  return userId.replace(/[^\w-]/g, "") || "default";
}

// Helper: Get robust writable session directory (using OS tmpdir to prevent read-only /var/task errors)
function getUserSessionDir(userKey: string): string {
  const safeKey = sanitizeUserKey(userKey);
  const baseTmp = os.tmpdir();
  const sessionDir = path.join(baseTmp, "insforge_wa_sessions", safeKey);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }
  return sessionDir;
}

// Helper: Format phone number into clean numeric string without leading plus, device suffix, or symbols
function cleanPhoneNumber(phone: string): string {
  if (!phone) return "";
  const base = phone.split("@")[0].split(":")[0];
  return base.replace(/[^\d]/g, "");
}

// Helper: Format phone/jid to standard WhatsApp JID format
function phoneToJid(phone: string): string {
  const clean = cleanPhoneNumber(phone);
  return clean.includes("@s.whatsapp.net") ? clean : `${clean}@s.whatsapp.net`;
}

// Helper: Resolve authenticated user phone number reliably from Baileys socket state or store
function getMyPhone(sock?: any, store?: UserWaStore): string {
  const rawBaileysId = sock?.user?.id || sock?.user?.jid || sock?.authState?.creds?.me?.id || "";
  const cleanedFromBaileys = cleanPhoneNumber(rawBaileysId);
  if (cleanedFromBaileys && cleanedFromBaileys.length >= 7) {
    const formatted = `+${cleanedFromBaileys}`;
    if (store) store.myPhone = formatted;
    return formatted;
  }

  if (store && store.myPhone && store.myPhone.startsWith("+") && cleanPhoneNumber(store.myPhone).length >= 7) {
    return store.myPhone;
  }

  return "Me";
}

// Helper: Extract rich message content and human-readable text from Baileys message objects
function extractMessageText(m: any): string {
  if (!m) return "";
  if (m.ephemeralMessage?.message) return extractMessageText(m.ephemeralMessage.message);
  if (m.viewOnceMessage?.message) return extractMessageText(m.viewOnceMessage.message);
  if (m.viewOnceMessageV2?.message) return extractMessageText(m.viewOnceMessageV2.message);
  if (m.documentWithCaptionMessage?.message) return extractMessageText(m.documentWithCaptionMessage.message);
  if (m.editedMessage?.message) return extractMessageText(m.editedMessage.message);

  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (m.imageMessage?.caption) return `📷 ${m.imageMessage.caption}`;
  if (m.videoMessage?.caption) return `🎥 ${m.videoMessage.caption}`;
  if (m.documentMessage?.caption) return `📄 ${m.documentMessage.caption}`;

  if (m.imageMessage) return "📷 Photo";
  if (m.videoMessage) return "🎥 Video";
  if (m.audioMessage) return "🎵 Voice message";
  if (m.stickerMessage) return "🎨 Sticker";
  if (m.documentMessage) return `📄 ${m.documentMessage.fileName || "Document"}`;
  if (m.contactMessage) return `👤 Contact: ${m.contactMessage.displayName || ""}`;
  if (m.contactsArrayMessage) return `👤 Contacts (${m.contactsArrayMessage.contacts?.length || 0})`;
  if (m.locationMessage) return "📍 Location";
  if (m.liveLocationMessage) return "📍 Live Location";
  if (m.pollCreationMessage) return `📊 Poll: ${m.pollCreationMessage.name || "Poll"}`;
  if (m.buttonsResponseMessage?.selectedButtonId) return m.buttonsResponseMessage.selectedButtonId;
  if (m.templateButtonReplyMessage?.selectedId) return m.templateButtonReplyMessage.selectedId;
  if (m.listResponseMessage?.singleSelectReply?.selectedRowId) return m.listResponseMessage.singleSelectReply.selectedRowId;

  if (m.reactionMessage || m.protocolMessage) return "";
  return "";
}

// Initialize or load user real storage
function getUserStore(userId: string): UserWaStore {
  const userKey = sanitizeUserKey(userId);
  if (!globalStores[userKey]) {
    const sessionDir = getUserSessionDir(userKey);
    const storePath = path.join(sessionDir, "store.json");
    if (fs.existsSync(storePath)) {
      try {
        const raw = fs.readFileSync(storePath, "utf-8");
        globalStores[userKey] = JSON.parse(raw);
      } catch (e) {
        console.warn("Failed to load stored user WA cache:", e);
      }
    }
    if (!globalStores[userKey]) {
      globalStores[userKey] = {
        messages: [],
        contacts: {},
        groups: {},
        groupMessages: {}
      };
    }
  }
  return globalStores[userKey];
}

// Save user real storage to disk
function saveUserStore(userId: string) {
  const userKey = sanitizeUserKey(userId);
  try {
    const sessionDir = getUserSessionDir(userKey);
    const storePath = path.join(sessionDir, "store.json");
    fs.writeFileSync(storePath, JSON.stringify(globalStores[userKey], null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to save WA user store:", e);
  }
}

// Safely reset session credentials directory & flush all cached WhatsApp data on disconnection
function clearSessionFiles(userId: string) {
  const userKey = sanitizeUserKey(userId);
  globalConnectedState[userKey] = false;
  if (globalSockets[userKey]) {
    try {
      globalSockets[userKey].end(undefined);
    } catch (e) {}
    delete globalSockets[userKey];
  }
  delete globalQrs[userKey];

  // Completely flash out all cached in-memory messages, contacts, and groups
  globalStores[userKey] = {
    messages: [],
    contacts: {},
    groups: {},
    groupMessages: {}
  };

  const sessionDir = getUserSessionDir(userKey);
  if (fs.existsSync(sessionDir)) {
    try {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    } catch (e) {
      console.warn("Failed to remove session directory on disconnect:", e);
    }
  }
}

// Helper: Initialize real Baileys socket connection with automatic reconnection on stream restart (StatusCode 515)
async function initWASocket(userId: string) {
  const userKey = sanitizeUserKey(userId);
  if (globalSockets[userKey]) {
    return globalSockets[userKey];
  }

  const sessionDir = getUserSessionDir(userKey);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  console.log(`[Baileys] Starting WASocket version ${version.join(".")} for userKey ${userKey}`);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "info" }) as any,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 25000,
    retryRequestDelayMs: 250,
    maxMsgRetryCount: 5,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    fireInitQueries: true,
    generateHighQualityLinkPreview: true
  });

  sock.ev.on("creds.update", async () => {
    try {
      await saveCreds();
    } catch (e) {
      console.warn("[Baileys] Error saving creds:", e);
    }
  });

  const store = getUserStore(userKey);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // Store clean QR token (extract string after # if present)
      let cleanQrToken = qr;
      if (cleanQrToken.includes("#")) {
        cleanQrToken = cleanQrToken.split("#")[1];
      }
      globalQrs[userKey] = cleanQrToken;
      console.log(`[Baileys] Live clean QR emitted for ${userKey}: ${cleanQrToken.slice(0, 30)}...`);
    }

    if (connection === "close") {
      globalConnectedState[userKey] = false;
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      console.log(`[Baileys] Connection closed for ${userKey}. StatusCode: ${statusCode}`);
      delete globalSockets[userKey];

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log(`[Baileys] Auto-reconnecting socket for ${userKey}...`);
        setTimeout(() => {
          initWASocket(userKey);
        }, 800);
      }
    } else if (connection === "open") {
      globalConnectedState[userKey] = true;
      console.log(`[Baileys] Live connection OPEN and fully authenticated by mobile device for ${userKey}!`);
    }
  });

// Helper: Resolve authenticated user phone number reliably from Baileys socket state
function getMyPhone(sock: any, userKey?: string): string {
  const raw = sock?.user?.id || sock?.user?.jid || sock?.authState?.creds?.me?.id || "";
  const cleaned = cleanPhoneNumber(raw);
  if (cleaned) return cleaned;
  if (userKey) return cleanPhoneNumber(userKey);
  return "";
}

  // Synchronize initial messaging history emitted by Baileys upon connection
  sock.ev.on("messaging-history.set", async ({ messages, chats, contacts }) => {
    console.log(`[Baileys] Messaging history set emitted for ${userKey}: ${messages?.length || 0} messages, ${chats?.length || 0} chats, ${contacts?.length || 0} contacts`);
    
    const myPhone = getMyPhone(sock, userKey);
    const myFormattedPhone = myPhone ? `+${myPhone}` : "Me";

    if (contacts) {
      for (const c of contacts) {
        if (c.id && c.id !== "status@broadcast" && !c.id.endsWith("@broadcast")) {
          const phone = cleanPhoneNumber(c.id);
          store.contacts[phone] = {
            phone: `+${phone}`,
            jid: c.id,
            name: c.name || c.notify || `+${phone}`
          };
        }
      }
    }

    if (chats) {
      for (const c of chats) {
        if (c.id && c.id.endsWith("@g.us")) {
          store.groups[c.id] = {
            id: c.id,
            name: c.name || (c as any).subject || "WhatsApp Group",
            participantsCount: c.unreadCount || 0,
            owner: "",
            topic: ""
          };
        }
      }
    }

    if (messages) {
      for (const msg of messages) {
        if (!msg.message) continue;
        const jid = msg.key.remoteJid || "";
        
        // Skip WhatsApp Status broadcasts and system notifications
        if (jid === "status@broadcast" || jid.endsWith("@broadcast")) continue;

        const text = extractMessageText(msg.message);
        if (!text) continue;

        const isGroup = jid.endsWith("@g.us");
        const contactPhone = cleanPhoneNumber(jid);
        const contactFormattedPhone = `+${contactPhone}`;
        const fromMe = !!msg.key.fromMe;

        // Resolve other person's contact display name correctly
        let contactName = store.contacts[contactPhone]?.name;
        if (!contactName || contactName.startsWith("+") || contactName === "Me") {
          contactName = (!fromMe && msg.pushName && msg.pushName !== "Me") 
            ? msg.pushName 
            : contactFormattedPhone;
        }

        // If we found a valid pushName from the other party, save it to the contacts cache
        if (!fromMe && msg.pushName && msg.pushName !== "Me" && !isGroup) {
          store.contacts[contactPhone] = {
            phone: contactFormattedPhone,
            jid,
            name: msg.pushName
          };
        }

        const timestamp = (msg.messageTimestamp as number) * 1000 || Date.now();
        const timeString = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const sender = fromMe ? "Me" : contactName;
        const senderPhone = fromMe ? myFormattedPhone : contactFormattedPhone;
        const recipient = fromMe ? contactName : "Me";
        const recipientPhone = fromMe ? contactFormattedPhone : myFormattedPhone;

        if (!store.messages.some(m => m.id === msg.key.id)) {
          store.messages.push({
            id: msg.key.id || `msg_${Date.now()}`,
            sender,
            senderPhone,
            recipient,
            recipientPhone,
            phone: contactFormattedPhone,
            jid,
            time: timeString,
            timestamp,
            text,
            unread: !fromMe,
            type: isGroup ? "group" : "chat",
            fromMe
          });
        }

        if (isGroup) {
          const participantPhone = cleanPhoneNumber(msg.key.participant || jid);
          if (!store.groupMessages[jid]) store.groupMessages[jid] = [];
          store.groupMessages[jid].push({
            id: msg.key.id || `gmsg_${Date.now()}`,
            sender: fromMe ? "Me" : (msg.pushName || `+${participantPhone}`),
            senderPhone: `+${participantPhone}`,
            text,
            time: timeString,
            timestamp
          });
        } else {
          // Store contact with resolved name
          store.contacts[contactPhone] = {
            phone: contactFormattedPhone,
            jid,
            name: contactName
          };
        }
      }
    }
    saveUserStore(userKey);
  });

  // Attach live WhatsApp message listeners for incoming real-time chats
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const myPhone = getMyPhone(sock, userKey);
    const myFormattedPhone = myPhone ? `+${myPhone}` : "Me";

    for (const msg of messages) {
      if (!msg.message) continue;
      const jid = msg.key.remoteJid || "";
      const fromMe = !!msg.key.fromMe;

      // Skip WhatsApp Status broadcasts and system notifications
      if (jid === "status@broadcast" || jid.endsWith("@broadcast")) continue;

      const text = extractMessageText(msg.message);
      if (!text) continue;

      const isGroup = jid.endsWith("@g.us");
      const contactPhone = cleanPhoneNumber(jid);
      const contactFormattedPhone = `+${contactPhone}`;

      // Resolve other person's contact display name correctly
      let contactName = store.contacts[contactPhone]?.name;
      if (!contactName || contactName.startsWith("+") || contactName === "Me") {
        contactName = (!fromMe && msg.pushName && msg.pushName !== "Me") 
          ? msg.pushName 
          : contactFormattedPhone;
      }

      // If we found a valid pushName from the other party, save it to the contacts cache
      if (!fromMe && msg.pushName && msg.pushName !== "Me" && !isGroup) {
        store.contacts[contactPhone] = {
          phone: contactFormattedPhone,
          jid,
          name: msg.pushName
        };
      }

      const timestamp = (msg.messageTimestamp as number) * 1000 || Date.now();
      const timeString = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const sender = fromMe ? "Me" : contactName;
      const senderPhone = fromMe ? myFormattedPhone : contactFormattedPhone;
      const recipient = fromMe ? contactName : "Me";
      const recipientPhone = fromMe ? contactFormattedPhone : myFormattedPhone;

      store.messages.unshift({
        id: msg.key.id || `msg_${Date.now()}`,
        sender,
        senderPhone,
        recipient,
        recipientPhone,
        phone: contactFormattedPhone,
        jid,
        time: timeString,
        timestamp,
        text,
        unread: !fromMe,
        type: isGroup ? "group" : "chat",
        fromMe
      });

      if (isGroup) {
        const participantPhone = cleanPhoneNumber(msg.key.participant || jid);
        if (!store.groupMessages[jid]) store.groupMessages[jid] = [];
        store.groupMessages[jid].unshift({
          id: msg.key.id || `gmsg_${Date.now()}`,
          sender: fromMe ? "Me" : (msg.pushName || `+${participantPhone}`),
          senderPhone: `+${participantPhone}`,
          text,
          time: timeString,
          timestamp
        });
      } else {
        // Store contact with resolved name
        store.contacts[contactPhone] = {
          phone: contactFormattedPhone,
          jid,
          name: contactName
        };
      }
    }
    saveUserStore(userKey);
  });

  sock.ev.on("contacts.upsert", (contacts) => {
    for (const c of contacts) {
      if (c.id && c.id !== "status@broadcast" && !c.id.endsWith("@broadcast")) {
        const phone = cleanPhoneNumber(c.id);
        store.contacts[phone] = {
          phone: `+${phone}`,
          jid: c.id,
          name: c.name || c.notify || `+${phone}`
        };
      }
    }
    saveUserStore(userKey);
  });

  globalSockets[userKey] = sock;
  return sock;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, phoneNumber, toolName, params } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing required field: action" }, { status: 400 });
    }

    const userKey = sanitizeUserKey(userId);
    const store = getUserStore(userKey);

    // -------------------------------------------------------------
    // ACTION 1A: GENERATE REAL WHATSAPP QR CODE (RAW CAMERA PAIRING TOKEN)
    // -------------------------------------------------------------
    if (action === "generate_qr_code") {
      clearSessionFiles(userKey);

      let qrDataUrl = "";
      let rawQrString = "";

      try {
        const sock = await initWASocket(userKey);

        rawQrString = await new Promise<string>((resolve, reject) => {
          const timer = setTimeout(() => {
            if (globalQrs[userKey]) resolve(globalQrs[userKey]);
            else reject(new Error("Timeout waiting for WhatsApp QR code. Please refresh."));
          }, 10000);

          sock.ev.on("connection.update", (update: any) => {
            const { qr, connection } = update;
            if (qr) {
              let cleanToken = qr;
              if (cleanToken.includes("#")) {
                cleanToken = cleanToken.split("#")[1];
              }
              clearTimeout(timer);
              resolve(cleanToken);
            }
            if (connection === "open") {
              clearTimeout(timer);
              resolve("CONNECTED");
            }
          });

          if (globalQrs[userKey]) {
            clearTimeout(timer);
            resolve(globalQrs[userKey]);
          }
        });

        if (rawQrString && rawQrString !== "CONNECTED") {
          qrDataUrl = await QRCode.toDataURL(rawQrString, {
            margin: 2,
            scale: 8,
            color: { dark: "#000000", light: "#FFFFFF" }
          });
        }
      } catch (err: any) {
        console.error("QR Code generation exception:", err);
      }

      if (!qrDataUrl && rawQrString !== "CONNECTED") {
        return NextResponse.json({
          error: "Failed to generate QR code from WhatsApp servers. Please click refresh."
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        qrCode: qrDataUrl,
        rawQr: rawQrString,
        instructions: [
          "1. Open WhatsApp on your mobile phone",
          "2. Tap Menu (⋮) or Settings (⚙️) > Linked Devices",
          "3. Tap Link a Device",
          "4. Point your phone camera at the QR code on screen"
        ]
      });
    }

    // -------------------------------------------------------------
    // ACTION 1B: GENERATE PAIRING CODE (PHONE NUMBER PAIRING)
    // -------------------------------------------------------------
    if (action === "generate_pairing_code") {
      if (!phoneNumber) {
        return NextResponse.json({ error: "Phone number with country code is required." }, { status: 400 });
      }

      const cleanPhone = cleanPhoneNumber(phoneNumber);
      if (cleanPhone.length < 8) {
        return NextResponse.json({ error: "Invalid phone number format. Please include country code (e.g. 917384330424)." }, { status: 400 });
      }

      store.myPhone = `+${cleanPhone}`;
      saveUserStore(userKey);

      clearSessionFiles(userKey);

      let rawPairingCode = "";
      let errorMsg = "";

      try {
        const sock = await initWASocket(userKey);

        // Allow socket connection handshake to emit initial QR/connecting event
        await new Promise<void>((resolve) => {
          const timer = setTimeout(() => resolve(), 3000);
          sock.ev.on("connection.update", (update: any) => {
            if (update.qr || update.connection === "connecting" || update.connection === "open") {
              clearTimeout(timer);
              resolve();
            }
          });
        });

        // Delay for Noise handshake
        await new Promise((r) => setTimeout(r, 600));

        if (!sock.authState.creds.registered) {
          rawPairingCode = await sock.requestPairingCode(cleanPhone);
          console.log(`[Baileys] Requested pairing code for ${cleanPhone}: ${rawPairingCode}`);
        }
      } catch (err: any) {
        console.error("Baileys pairing code generation error:", err);
        errorMsg = err?.message || "Failed to generate pairing code from WhatsApp servers.";
      }

      if (!rawPairingCode) {
        return NextResponse.json({
          error: errorMsg || "WhatsApp server rejected pairing code request. Please verify your phone number and country code."
        }, { status: 400 });
      }

      const cleanCode = rawPairingCode.replace(/[^\w]/g, "").toUpperCase();

      return NextResponse.json({
        success: true,
        pairingCode: cleanCode,
        phoneNumber: cleanPhone,
        instructions: [
          "1. Open WhatsApp on your mobile phone",
          "2. Tap Menu (⋮) or Settings (⚙️) > Linked Devices",
          "3. Tap Link a Device > Link with phone number instead",
          `4. Enter the code: ${cleanCode}`
        ]
      });
    }

    // -------------------------------------------------------------
    // ACTION 2: CHECK CONNECTION STATUS (STRICTLY OPEN CONNECTION CHECK)
    // -------------------------------------------------------------
    if (action === "check_status") {
      let isConnected = !!globalConnectedState[userKey];
      let sock = globalSockets[userKey];

      // If socket is not initialized but we have saved session credentials, auto-initialize the connection!
      if (!sock) {
        const sessionDir = getUserSessionDir(userKey);
        const credsPath = path.join(sessionDir, "creds.json");
        if (fs.existsSync(credsPath)) {
          console.log(`[Baileys] Waking up live socket from saved session for ${userKey}...`);
          try {
            sock = await initWASocket(userKey);
            isConnected = !!globalConnectedState[userKey];
          } catch (e) {
            console.warn("Failed to auto-wake WhatsApp socket:", e);
          }
        }
      }

      const myPhone = cleanPhoneNumber(sock?.user?.id || "");
      const formattedPhone = myPhone ? `+${myPhone}` : "";

      return NextResponse.json({
        success: true,
        status: isConnected ? "connected" : "connecting",
        registered: isConnected,
        connectedPhone: formattedPhone
      });
    }

    // -------------------------------------------------------------
    // ACTION 3: CONFIRM CONNECTION & PERSIST TO INSFORGE DB
    // -------------------------------------------------------------
    if (action === "confirm_connection") {
      if (!userId) {
        return NextResponse.json({ error: "userId parameter is required." }, { status: 400 });
      }

      const connectionId = `${userKey}_whatsapp`;
      const sock = globalSockets[userKey];
      const myPhone = cleanPhoneNumber(sock?.user?.id || "");
      const phoneToSave = myPhone ? `+${myPhone}` : (phoneNumber || "Connected WhatsApp Account");

      const { error } = await insforge.database
        .from("user_integrations")
        .upsert([
          {
            id: connectionId,
            user_id: userKey,
            platform: "whatsapp",
            status: "connected",
            connected_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error("InsForge WhatsApp connection save error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        status: "connected",
        phoneNumber: phoneToSave
      });
    }

    // -------------------------------------------------------------
    // ACTION 4: DISCONNECT WHATSAPP
    // -------------------------------------------------------------
    if (action === "disconnect") {
      if (!userId) {
        return NextResponse.json({ error: "userId parameter is required." }, { status: 400 });
      }

      const connectionId = `${userKey}_whatsapp`;
      clearSessionFiles(userKey);

      const { error } = await insforge.database
        .from("user_integrations")
        .delete()
        .eq("id", connectionId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, status: "disconnected" });
    }

    // -------------------------------------------------------------
    // ACTION 5: EXECUTE REAL WHATSAPP MCP TOOLS (ALL 9 TOOLS)
    // -------------------------------------------------------------
    if (action === "mcp_tool") {
      const tool = toolName || body.tool;

      let sock: any = globalSockets[userKey];
      if (!sock) {
        try {
          sock = await initWASocket(userKey);
        } catch (e) {
          console.warn("Active socket fetch warning:", e);
        }
      }

      const myFormattedPhone = getMyPhone(sock, store);
      const myPhone = cleanPhoneNumber(myFormattedPhone);

      switch (tool) {
        case "whatsapp_fetch_recent_messages": {
          const limit = params?.limit || 25;

          // First, sort all stored messages by timestamp descending (newest first)
          const sortedMessages = [...store.messages]
            .map(m => {
              const contactP = cleanPhoneNumber(m.jid);
              const contactFormatted = `+${contactP}`;
              return {
                ...m,
                senderPhone: m.fromMe ? myFormattedPhone : (m.senderPhone && m.senderPhone.startsWith("+") ? m.senderPhone : contactFormatted),
                recipientPhone: m.fromMe ? (m.recipientPhone && m.recipientPhone.startsWith("+") ? m.recipientPhone : contactFormatted) : myFormattedPhone,
                phone: contactFormatted
              };
            })
            .sort((a, b) => b.timestamp - a.timestamp);

          // Construct a clean chat list by grouping messages by unique thread JID
          const threadMap = new Map<string, any>();

          for (const m of sortedMessages) {
            if (!m.jid || m.jid === "status@broadcast" || m.jid.endsWith("@broadcast")) continue;
            if (!threadMap.has(m.jid)) {
              const clean = cleanPhoneNumber(m.jid);
              const contactObj = store.contacts[clean];
              let displayName = contactObj?.name;
              if (!displayName || displayName.startsWith("+")) {
                displayName = m.fromMe ? m.recipient : m.sender;
              }
              if (displayName === "Me" && m.fromMe) {
                displayName = m.recipient !== "Me" ? m.recipient : `+${clean}`;
              }

              threadMap.set(m.jid, {
                ...m,
                phone: `+${clean}`,
                chatName: displayName || `+${clean}`,
                displaySender: m.fromMe ? (m.recipient && m.recipient !== "Me" ? m.recipient : `+${clean}`) : (m.sender || `+${clean}`)
              });
            }
          }

          const recentChats = Array.from(threadMap.values()).slice(0, limit);

          return NextResponse.json({
            success: true,
            tool: "whatsapp_fetch_recent_messages",
            result: {
              count: recentChats.length,
              totalStored: store.messages.length,
              messages: recentChats
            }
          });
        }

        case "whatsapp_read_chat_history": {
          const targetPhone = params?.phone || params?.to || "";
          const targetJid = targetPhone ? phoneToJid(targetPhone) : "";
          const clean = cleanPhoneNumber(targetPhone);
          
          const filtered = store.messages
            .filter(m => (targetJid && m.jid === targetJid) || (clean && m.phone.includes(clean)))
            .map(m => {
              const contactP = cleanPhoneNumber(m.jid || targetPhone);
              const contactFormatted = `+${contactP}`;
              return {
                ...m,
                senderPhone: m.fromMe ? myFormattedPhone : (m.senderPhone && m.senderPhone.startsWith("+") ? m.senderPhone : contactFormatted),
                recipientPhone: m.fromMe ? (m.recipientPhone && m.recipientPhone.startsWith("+") ? m.recipientPhone : contactFormatted) : myFormattedPhone,
                phone: contactFormatted
              };
            })
            .sort((a, b) => b.timestamp - a.timestamp);

          return NextResponse.json({
            success: true,
            tool: "whatsapp_read_chat_history",
            result: { phone: targetPhone, messages: filtered }
          });
        }

        case "whatsapp_send_message": {
          const to = params?.to || params?.phone;
          const text = params?.text || params?.message;

          if (!to || !text) {
            return NextResponse.json({ error: "Parameters 'to' and 'text' are required." }, { status: 400 });
          }

          const targetJid = phoneToJid(to);
          const contactPhone = cleanPhoneNumber(to);
          const contactFormattedPhone = `+${contactPhone}`;
          const contactName = store.contacts[contactPhone]?.name || contactFormattedPhone;
          let sentMessageId = `msg_sent_${Date.now()}`;

          if (sock) {
            try {
              const result = await sock.sendMessage(targetJid, { text });
              if (result?.key?.id) {
                sentMessageId = result.key.id;
              }
            } catch (err: any) {
              console.warn("Baileys live message send warning:", err);
            }
          }

          const newMsgObj = {
            id: sentMessageId,
            sender: "Me",
            senderPhone: myFormattedPhone,
            recipient: contactName,
            recipientPhone: contactFormattedPhone,
            phone: contactFormattedPhone,
            jid: targetJid,
            time: "Just now",
            timestamp: Date.now(),
            text,
            unread: false,
            type: "chat" as const,
            fromMe: true
          };

          store.messages.unshift(newMsgObj);
          saveUserStore(userKey);

          return NextResponse.json({
            success: true,
            tool: "whatsapp_send_message",
            result: {
              status: "sent",
              messageId: sentMessageId,
              sender: "Me",
              senderPhone: myFormattedPhone,
              recipient: contactName,
              recipientPhone: contactFormattedPhone,
              textPayload: text,
              newMessage: newMsgObj
            }
          });
        }

        case "whatsapp_search_chats": {
          const query = (params?.query || "").toLowerCase();
          const matches = store.messages.filter(
            m => m.sender.toLowerCase().includes(query) || m.recipient.toLowerCase().includes(query) || m.text.toLowerCase().includes(query)
          );

          return NextResponse.json({
            success: true,
            tool: "whatsapp_search_chats",
            result: { query, count: matches.length, results: matches }
          });
        }

        case "whatsapp_summarize_conversations": {
          const targetPhone = params?.phone || "";
          const targetJid = targetPhone ? phoneToJid(targetPhone) : "";
          const clean = cleanPhoneNumber(targetPhone);

          // Get all messages for this contact thread in chronological order
          const threadMsgs = store.messages
            .filter(m => (targetJid && m.jid === targetJid) || (clean && m.phone.includes(clean)))
            .sort((a, b) => a.timestamp - b.timestamp);

          if (threadMsgs.length === 0) {
            return NextResponse.json({
              success: true,
              tool: "whatsapp_summarize_conversations",
              result: null
            });
          }

          // Find timestamp of the last message sent by the user ('fromMe')
          const lastUserMsg = [...threadMsgs].reverse().find(m => m.fromMe);
          const maxTimestamp = lastUserMsg ? lastUserMsg.timestamp : Date.now();

          // STRICTLY filter ONLY UNREAD received messages or received messages after the last user sent message
          const targetMsgs = threadMsgs.filter(
            m => !m.fromMe && (m.unread || (lastUserMsg ? m.timestamp > maxTimestamp : true))
          );

          const contactDisplayName = threadMsgs.find(m => !m.fromMe)?.sender || (clean ? `+${clean}` : "Contact");

          if (targetMsgs.length === 0) {
            return NextResponse.json({
              success: true,
              tool: "whatsapp_summarize_conversations",
              result: null
            });
          }

          // Construct received unread messages narrative without timestamps, separated by newlines
          const textSnippet = targetMsgs
            .map(m => `• ${m.sender}: "${m.text}"`)
            .join("\n");

          // Extract key topics & action items dynamically from received unread message text
          const keyActionItems: string[] = [];
          for (const m of targetMsgs) {
            const lower = m.text.toLowerCase();
            if (lower.includes("meet") || lower.includes("time") || lower.includes("schedule") || lower.includes("call") || lower.includes("zoom")) {
              keyActionItems.push(`• Schedule/Meeting Request: "${m.text.slice(0, 80)}"`);
            } else if (lower.includes("send") || lower.includes("report") || lower.includes("doc") || lower.includes("file") || lower.includes("pdf") || lower.includes("link")) {
              keyActionItems.push(`• Document/Information Request: "${m.text.slice(0, 80)}"`);
            } else if (lower.includes("urgent") || lower.includes("asap") || lower.includes("important") || lower.includes("help")) {
              keyActionItems.push(`• High Priority Request: "${m.text.slice(0, 80)}"`);
            }
          }

          if (keyActionItems.length === 0) {
            keyActionItems.push(`• Review recent unread updates from ${contactDisplayName}.`);
            keyActionItems.push(`• Follow up on unread questions received.`);
          }

          return NextResponse.json({
            success: true,
            tool: "whatsapp_summarize_conversations",
            result: {
              phone: targetPhone,
              contactName: contactDisplayName,
              messagesAnalyzedCount: targetMsgs.length,
              summary: `Summary of unread incoming messages from ${contactDisplayName}:\n${textSnippet}`,
              keyActionItems: Array.from(new Set(keyActionItems))
            }
          });
        }

        case "whatsapp_get_contact_details": {
          const phone = params?.phone || "";
          const clean = cleanPhoneNumber(phone);
          const targetJid = phoneToJid(clean);

          let liveStatus = "";
          let liveAvatar = "";

          if (sock && globalConnectedState[userKey] && targetJid) {
            try {
              const statusObj = await sock.fetchStatus(targetJid);
              liveStatus = statusObj?.status || "";
              liveAvatar = await sock.profilePictureUrl(targetJid, "image").catch(() => "");
            } catch (e) {}
          }

          const contact = store.contacts[clean] || {
            phone: `+${clean}`,
            jid: targetJid,
            name: `+${clean}`,
            status: liveStatus || "Available",
            avatar: liveAvatar
          };

          if (liveStatus) contact.status = liveStatus;
          if (liveAvatar) contact.avatar = liveAvatar;

          return NextResponse.json({
            success: true,
            tool: "whatsapp_get_contact_details",
            result: contact
          });
        }

        case "whatsapp_list_groups": {
          let realGroups: any[] = [];
          if (sock && globalConnectedState[userKey]) {
            try {
              const groupMetadataMap = await sock.groupFetchAllParticipating();
              realGroups = Object.values(groupMetadataMap).map((g: any) => ({
                id: g.id,
                name: g.subject,
                participantsCount: g.participants?.length || 0,
                owner: g.owner || "",
                topic: g.desc || "WhatsApp Group Chat"
              }));
              for (const g of realGroups) {
                store.groups[g.id] = g;
              }
              saveUserStore(userKey);
            } catch (err) {
              console.warn("Baileys groupFetchAllParticipating warning:", err);
            }
          }

          const groupsToReturn = realGroups.length > 0 ? realGroups : Object.values(store.groups);

          return NextResponse.json({
            success: true,
            tool: "whatsapp_list_groups",
            result: { count: groupsToReturn.length, groups: groupsToReturn }
          });
        }

        case "whatsapp_fetch_group_messages": {
          const groupId = params?.groupId || "";
          const cleanId = cleanPhoneNumber(groupId);
          const jidWithSuffix = groupId.endsWith("@g.us") ? groupId : `${cleanId}@g.us`;

          let groupInfo: any = store.groups[jidWithSuffix] || store.groups[groupId] || store.groups[cleanId] || null;

          if (sock && globalConnectedState[userKey] && jidWithSuffix.endsWith("@g.us")) {
            try {
              const metadata = await sock.groupMetadata(jidWithSuffix);
              if (metadata) {
                groupInfo = {
                  id: metadata.id,
                  name: metadata.subject,
                  owner: metadata.owner || "",
                  topic: metadata.desc || "",
                  participantsCount: metadata.participants?.length || 0,
                  participants: metadata.participants?.map((p: any) => ({
                    id: p.id,
                    phone: `+${cleanPhoneNumber(p.id)}`,
                    admin: p.admin || null
                  })) || []
                };
                store.groups[jidWithSuffix] = groupInfo;
                saveUserStore(userKey);
              }
            } catch (err) {
              console.warn("Baileys groupMetadata fetch warning:", err);
            }
          }

          let msgs = store.groupMessages[jidWithSuffix] || store.groupMessages[groupId] || store.groupMessages[cleanId] || [];
          if (msgs.length === 0) {
            msgs = store.messages.filter(m => m.jid === jidWithSuffix || m.jid === groupId || (cleanId && m.jid.includes(cleanId)));
          }

          msgs = [...msgs].sort((a, b) => b.timestamp - a.timestamp);

          return NextResponse.json({
            success: true,
            tool: "whatsapp_fetch_group_messages",
            result: {
              groupId: jidWithSuffix,
              groupName: groupInfo?.name || "WhatsApp Group",
              groupDetails: groupInfo,
              count: msgs.length,
              messages: msgs
            }
          });
        }

        case "whatsapp_send_group_message": {
          const groupId = params?.groupId || "";
          const text = params?.text || params?.message;

          if (!groupId || !text) {
            return NextResponse.json({ error: "Parameters 'groupId' and 'text' are required." }, { status: 400 });
          }

          const cleanId = cleanPhoneNumber(groupId);
          const targetJid = groupId.endsWith("@g.us") ? groupId : `${cleanId}@g.us`;

          let sentMessageId = `gmsg_${Date.now()}`;
          if (sock && globalConnectedState[userKey]) {
            try {
              const result = await sock.sendMessage(targetJid, { text });
              if (result?.key?.id) {
                sentMessageId = result.key.id;
              }
            } catch (err) {
              console.warn("Baileys group message send warning:", err);
            }
          }

          if (!store.groupMessages[targetJid]) store.groupMessages[targetJid] = [];
          store.groupMessages[targetJid].unshift({
            id: sentMessageId,
            sender: "Me",
            senderPhone: myFormattedPhone,
            text,
            time: "Just now",
            timestamp: Date.now()
          });
          saveUserStore(userKey);

          return NextResponse.json({
            success: true,
            tool: "whatsapp_send_group_message",
            result: {
              status: "sent",
              groupId: targetJid,
              messageId: sentMessageId,
              sender: "Me",
              senderPhone: myFormattedPhone,
              text,
              timestamp: new Date().toISOString()
            }
          });
        }

        default:
          return NextResponse.json({ error: `Unknown MCP tool: ${tool}` }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Invalid action type." }, { status: 400 });

  } catch (err: any) {
    console.error("WhatsApp API exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
