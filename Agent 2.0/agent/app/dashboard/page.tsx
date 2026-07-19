"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { insforge } from "@/lib/insforge";
import { 
  ViewGrid, 
  Brain, 
  Journal,  
  Bell, 
  Settings, 
  CreditCard, 
  NavArrowLeft, 
  RefreshDouble, 
  Check, 
  WarningTriangle, 
  Flash,
  SunLight,
  HalfMoon
} from "iconoir-react";

interface DbUserRecord {
  id: string;
  email: string | null;
  name: string;
  created_at: string;
  phone_number?: string | null;
  auth_provider?: string | null;
  verification_method?: string | null;
  last_login_at?: string | null;
}

const platformsList = [
  {
    id: "gmail",
    name: "Gmail",
    logoSrc: "/file.svg",
    description: "Parse incoming threads, synthesize messages, and automatically queue email response drafts.",
    mcpTools: [
      { name: "gmail_list_messages", description: "Fetch email headers and IDs with filters.", params: "limit (number, default: 5)" },
      { name: "gmail_get_message", description: "Retrieve content and attachments of a specific message.", params: "messageId (string)" },
      { name: "gmail_create_draft", description: "Draft response emails in the user's outbox.", params: "to (string), subject (string), body (string)" },
      { name: "gmail_send_message", description: "Send an email immediately through the Gmail API.", params: "to (string), subject (string), body (string)" }
    ]
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    logoSrc: "/window.svg",
    description: "Monitor text alerts, coordinate notifications, and trigger automated WhatsApp responses.",
    mcpTools: [
      { name: "whatsapp_send_otp", description: "Deliver one-time codes using WhatsApp gateway.", params: "to (string), code (string)" },
      { name: "whatsapp_receive_messages", description: "Poll incoming text notifications.", params: "limit (number)" }
    ]
  },
  {
    id: "slack",
    name: "Slack",
    logoSrc: "/globe.svg",
    description: "Track channel feeds, monitor thread highlights, and compile weekly slack standups.",
    mcpTools: [
      { name: "slack_post_message", description: "Send message payloads to specific Slack channels.", params: "channel (string), message (string)" },
      { name: "slack_read_history", description: "Fetch recent channel message feeds.", params: "channel (string), limit (number)" }
    ]
  },
  {
    id: "outlook",
    name: "Outlook",
    logoSrc: "/file.svg",
    description: "Monitor Microsoft inbox accounts, calendar events, and schedule meetings.",
    mcpTools: [
      { name: "outlook_list_events", description: "Retrieve user calendar scheduling logs.", params: "startDate (string), endDate (string)" },
      { name: "outlook_send_mail", description: "Deliver messages through Outlook client exchange.", params: "to (string), body (string)" }
    ]
  },
  {
    id: "discord",
    name: "Discord",
    logoSrc: "/window.svg",
    description: "Monitor channel feeds, forward bot notifications, and coordinate automated warnings.",
    mcpTools: [
      { name: "discord_post_embed", description: "Post rich embed messages into configured Discord webhooks.", params: "webhookUrl (string), title (string), content (string)" }
    ]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    logoSrc: "/globe.svg",
    description: "Analyze messages, summarize conversation histories, and schedule profile post feeds.",
    mcpTools: [
      { name: "linkedin_get_messages", description: "Check message threads from recruiters or leads.", params: "limit (number)" },
      { name: "linkedin_post_update", description: "Create professional posts on user feed.", params: "text (string)" }
    ]
  },
  {
    id: "telegram",
    name: "Telegram",
    logoSrc: "/window.svg",
    description: "Forward Telegram group summaries, track bot logs, and trigger direct notification pings.",
    mcpTools: [
      { name: "telegram_send_alert", description: "Post real-time bot notification templates.", params: "chatId (string), text (string)" }
    ]
  },
  {
    id: "others",
    name: "Others",
    logoSrc: "/globe.svg",
    description: "Establish custom webhook connectors and REST endpoints for arbitrary data synchronization.",
    mcpTools: [
      { name: "custom_webhook_dispatch", description: "Forward JSON payloads to user endpoints.", params: "url (string), payload (JSON)" }
    ]
  }
];

type TabType = "dashboard" | "ai-agent" | "briefing" | "integrations" | "alerts" | "settings" | "pricing";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [dbRecord, setDbRecord] = useState<DbUserRecord | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  
  // Sidebar states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Integrations states
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Gmail sandbox email states inside Settings dialog
  const [gmailEmails, setGmailEmails] = useState<any[]>([]);
  const [fetchingEmails, setFetchingEmails] = useState(false);
  const [emailLimit, setEmailLimit] = useState(5);

  // Gmail Settings Modal UI States (Interactive Console, Split Pane & JSON-RPC Terminal)
  const [gmailModalTab, setGmailModalTab] = useState<"console" | "tools" | "guide">("console");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchInboxQuery, setSearchInboxQuery] = useState("");
  const [jsonRpcLogs, setJsonRpcLogs] = useState<any[]>([
    {
      direction: "send",
      tool: "gmail_list_messages",
      timestamp: "5:53:02 PM",
      payload: {
        jsonrpc: "2.0",
        method: "gmail_list_messages",
        params: { q: "label:inbox" },
        id: 584
      }
    },
    {
      direction: "recv",
      tool: "gmail_list_messages",
      timestamp: "5:53:02 PM",
      payload: {
        jsonrpc: "2.0",
        result: {
          content: [
            {
              type: "text",
              text: '[\n  {\n    "id": "msg_901",\n    "threadId": "thread_12345",\n    "from": "John Doe <john.doe@acme.com>",\n    "subject": "Q2 Slides & Marketing Budget Proposal"\n  }\n]'
            }
          ]
        },
        id: 584
      }
    }
  ]);

  // AI Agent runner states
  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentResult, setAgentResult] = useState<any>(null);
  const [agentLogs, setAgentLogs] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("omnisync_theme");
      if (stored === "light") {
        setTheme("light");
      }
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
      localStorage.setItem("omnisync_theme", "light");
    } else {
      root.classList.remove("light-theme");
      localStorage.setItem("omnisync_theme", "dark");
    }
  }, [theme]);

  // Protected route check
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch PostgreSQL user profile record to confirm database sync
  useEffect(() => {
    const fetchDbProfile = async () => {
      if (!user) return;
      setDbLoading(true);
      try {
        const { data, error } = await insforge.database
          .from("users")
          .select("*")
          .eq("id", user.id);

        if (error) {
          console.error("Database fetch error:", error);
        } else if (data && data.length > 0) {
          setDbRecord(data[0] as DbUserRecord);
        }
      } catch (err) {
        console.error("Failed to query DB user:", err);
      } finally {
        setDbLoading(false);
      }
    };

    fetchDbProfile();
  }, [user]);

  // Fetch connected platform status directly from InsForge PostgreSQL database
  const loadIntegrations = async () => {
    if (!user) return;
    setLoadingIntegrations(true);
    try {
      const { data, error } = await insforge.database
        .from("user_integrations")
        .select("platform")
        .eq("user_id", user.id)
        .eq("status", "connected");

      if (error) {
        console.error("InsForge SDK fetch error:", error);
      } else if (data) {
        setConnectedPlatforms(data.map((item: any) => item.platform));
      }
    } catch (err) {
      console.error("Load integrations error:", err);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
    if (typeof window !== "undefined" && user) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("gmail_connected") === "true") {
        const connectionId = `${user.id}_gmail`;
        insforge.database
          .from("user_integrations")
          .upsert([
            {
              id: connectionId,
              user_id: user.id,
              platform: "gmail",
              status: "connected",
              connected_at: new Date().toISOString()
            }
          ])
          .then(() => {
            loadIntegrations();
          });
      }
    }
  }, [user]);

  const handleConnect = async (platformId: string) => {
    if (!user) return;
    if (platformId === "gmail") {
      handleGoogleOAuthConnect();
      return;
    }
    const connectionId = `${user.id}_${platformId}`;
    try {
      const { error } = await insforge.database
        .from("user_integrations")
        .upsert([
          {
            id: connectionId,
            user_id: user.id,
            platform: platformId,
            status: "connected",
            connected_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error("InsForge connect error:", error);
      } else {
        await loadIntegrations();
      }
    } catch (err) {
      console.error("Connect platform error:", err);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (!user) return;
    const connectionId = `${user.id}_${platformId}`;
    try {
      const { error } = await insforge.database
        .from("user_integrations")
        .delete()
        .eq("id", connectionId);

      if (error) {
        console.error("InsForge disconnect error:", error);
      } else {
        await loadIntegrations();
      }
    } catch (err) {
      console.error("Disconnect platform error:", err);
    }
  };

  const handleGoogleOAuthConnect = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/integrations/gmail/auth?userId=${user.id}`);
      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to generate Google OAuth URL");
      }
    } catch (err) {
      console.error("Google OAuth connect error:", err);
    }
  };

  const runGmailMcpTool = async () => {
    setFetchingEmails(true);
    const activeAccount = user?.email || user?.profile?.name || "bnk.avik@gmail.com";
    try {
      const response = await fetch("/api/integrations/gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "gmail_list_messages",
          accountEmail: activeAccount,
          userId: user?.id,
          params: { limit: emailLimit }
        })
      });
      const data = await response.json();
      if (data.success) {
        setGmailEmails(data.result.messages);
      } else {
        alert(data.error || "Gmail MCP error");
      }
    } catch (err) {
      console.error("Error executing Gmail MCP:", err);
    } finally {
      setFetchingEmails(false);
    }
  };

  const runAgentCommand = async (commandPrompt?: string) => {
    const promptToRun = commandPrompt || agentPrompt;
    if (!promptToRun || !user) return;

    setAgentRunning(true);
    setAgentResult(null);

    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToRun,
          userId: user.id,
          accountEmail: user.email || "bnk.avik@gmail.com"
        })
      });
      const data = await response.json();
      if (data.success) {
        setAgentResult(data.result);
        fetchAgentLogs();
        setAgentPrompt("");
      } else {
        alert(data.error || "Agent execution failed");
      }
    } catch (err) {
      console.error("Run agent command error:", err);
    } finally {
      setAgentRunning(false);
    }
  };

  const fetchAgentLogs = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/agent/run?userId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setAgentLogs(data.logs);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (activeTab === "ai-agent" && user) {
      fetchAgentLogs();
    }
  }, [activeTab, user]);

  if (loading || (!user && !loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-zinc-400">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  const avatarInitial = user.profile?.name?.[0] || user.email?.[0]?.toUpperCase() || "?";

  // Sidebar Menu Configuration
  const menuItems = [
    {
      tab: "dashboard" as TabType,
      label: "Dashboard",
      colorBg: "bg-indigo-600",
      colorText: "text-indigo-400",
      icon: <ViewGrid className="w-5.5 h-5.5" />
    },
    {
      tab: "ai-agent" as TabType,
      label: "AI Agent",
      colorBg: "bg-purple-600",
      colorText: "text-purple-400",
      icon: <Brain className="w-5.5 h-5.5" />
    },
    {
      tab: "briefing" as TabType,
      label: "Briefing",
      colorBg: "bg-cyan-600",
      colorText: "text-cyan-400",
      icon: <Journal className="w-5.5 h-5.5" />
    },
    {
      tab: "integrations" as TabType,
      label: "Integrations",
      colorBg: "bg-emerald-600",
      colorText: "text-emerald-400",
      icon: <Check className="w-5.5 h-5.5" />
    },
    {
      tab: "alerts" as TabType,
      label: "Alerts",
      colorBg: "bg-rose-600",
      colorText: "text-rose-400",
      icon: <Bell className="w-5.5 h-5.5" />
    },
    {
      tab: "settings" as TabType,
      label: "Settings",
      colorBg: "bg-zinc-700",
      colorText: "text-zinc-400",
      icon: <Settings className="w-5.5 h-5.5" />
    }
  ];

  return (
    <div className="relative min-h-screen bg-background flex text-zinc-350 font-sans selection:bg-indigo-500/30 selection:text-white overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-15 pointer-events-none z-0" />

      {/* Sidebar Wrapper */}
      <aside 
        className={`glassmorphism h-screen sticky top-0 flex flex-col justify-between border-r border-zinc-850 shadow-2xl z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Top Header */}
        <div className="flex flex-col gap-6 p-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/10">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-neutral-950">
                  <Flash className="h-4.5 w-4.5 text-indigo-400 animate-float" />
                </div>
              </div>
              {!isCollapsed && (
                <span className="font-bold text-base tracking-tight text-white animate-in fade-in duration-300">
                  OmniSync<span className="text-indigo-400">.ai</span>
                </span>
              )}
            </div>
            
            {/* Toggle Arrow */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-neutral-900/60 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <NavArrowLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
            </button>
          </div>

          <hr className="border-zinc-850" />

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2.5">
            {menuItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`flex items-center gap-4 p-2.5 rounded-xl transition-all cursor-pointer text-left w-full group ${
                    isActive 
                      ? "bg-neutral-900 border border-zinc-800/80 shadow" 
                      : "hover:bg-neutral-900/40 border border-transparent"
                  }`}
                >
                  {/* Large Icon Wrapper with Solid Color Background */}
                  <div 
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105 ${
                      isActive 
                        ? `${item.colorBg} text-white-always` 
                        : "bg-[var(--bg-panel-hover)] text-zinc-400 border border-[var(--border)] group-hover:text-zinc-250"
                    }`}
                  >
                    {item.icon}
                  </div>

                  {!isCollapsed && (
                    <span 
                      className={`text-xs font-bold tracking-wide transition-colors ${
                        isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Panel */}
        <div className="flex flex-col gap-4 p-4 border-t border-zinc-850">
          
          {/* Pricing tab button */}
          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-4 p-2.5 rounded-xl transition-all cursor-pointer text-left w-full group ${
              activeTab === "pricing" 
                ? "bg-neutral-900 border border-zinc-800/80 shadow" 
                : "hover:bg-neutral-900/40 border border-transparent"
            }`}
          >
            {/* Solid Amber Icon */}
            <div 
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105 ${
                activeTab === "pricing" 
                  ? "bg-amber-600 text-white-always" 
                  : "bg-[var(--bg-panel-hover)] text-zinc-400 border border-[var(--border)] group-hover:text-zinc-250"
              }`}
            >
              <CreditCard className="w-5.5 h-5.5" />
            </div>
            {!isCollapsed && (
              <span 
                className={`text-xs font-bold tracking-wide transition-colors ${
                  activeTab === "pricing" ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              >
                Pricing Settings
              </span>
            )}
          </button>

          {/* User Profile Summary */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white shadow">
              {avatarInitial}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden flex flex-col justify-center animate-in fade-in duration-300">
                <span className="text-[11px] font-bold text-white truncate max-w-[130px]">
                  {user.profile?.name || user.email?.split("@")[0] || "Workspace Member"}
                </span>
                <span className="text-[9px] text-zinc-500 truncate max-w-[130px]">
                  {user.email || user.phone_number || "Active Workspace"}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={logout}
            className="w-full text-center text-[10px] font-bold py-2 bg-neutral-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-950/40 rounded-xl transition-all cursor-pointer"
          >
            {isCollapsed ? "➔" : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative z-10 px-6 sm:px-10 py-10">
        
        {/* Dashboard Header with active tab label & Theme Toggle */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-850/80 max-w-5xl mx-auto">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {activeTab === "pricing" ? "Pricing Settings" : activeTab.replace("-", " ")}
            </h2>
            <span className="text-[11px] text-zinc-500">OmniSync Secure Assistant Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Switch */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 border border-zinc-800 text-white hover:text-indigo-400 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
              title="Toggle color theme"
            >
              {theme === "dark" ? (
                <SunLight className="w-5 h-5 text-amber-400" />
              ) : (
                <HalfMoon className="w-5 h-5 text-indigo-500" />
              )}
            </button>
          </div>
        </header>

        {/* Tab 1: Dashboard */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="glassmorphism-card rounded-2xl p-8 border border-zinc-850 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Hello, {user.profile?.name || user.email?.split("@")[0] || "Workspace Member"}!
              </h1>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-2xl">
                Welcome to your personal assistant command center. Connect your active email and chat channels, and deploy AI agents to automatically monitor, summarize, and coordinate notifications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* User profile metadata */}
              <div className="glassmorphism-card rounded-2xl p-6 border border-zinc-850 shadow-2xl">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                  Agent Identity Metadata
                </h3>
                <div className="flex items-center gap-4 pb-4 border-b border-zinc-900 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl font-bold text-indigo-400">
                    {avatarInitial}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-sm font-bold text-white block truncate">
                      {user.profile?.name || "Workspace Member"}
                    </span>
                    <span className="text-xs text-zinc-400 block truncate mt-0.5">
                      {user.email || user.phone_number || "No email/phone"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Identity ID</span>
                    <span className="font-mono text-[10px] text-zinc-300 bg-neutral-950 px-2 py-1 rounded border border-zinc-900">
                      {user.id}
                    </span>
                  </div>
                  {user.phone_number && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Phone Number</span>
                      <span className="text-zinc-300 font-mono text-[11px]">{user.phone_number}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Authentication</span>
                    <div className="flex gap-1.5">
                      {user.providers?.map((p: string, i: number) => (
                        <span key={i} className="capitalize font-bold text-[9px] bg-zinc-850 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-800">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Created At</span>
                    <span className="text-zinc-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Db profile sync stats */}
              <div className="glassmorphism-card rounded-2xl p-6 border border-zinc-850 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                  Database Sync Verification
                </h3>
                {dbLoading ? (
                  <div className="flex items-center gap-2.5 text-xs text-zinc-400 py-2">
                    <svg className="animate-spin h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Checking profile records...</span>
                  </div>
                ) : dbRecord ? (
                  <div className="flex flex-col gap-3 py-1">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Connected & Synced</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Your identity has been verified and successfully provisioned inside the PostgreSQL database under the <strong>`users`</strong> table.
                    </p>
                    <div className="p-3 bg-neutral-950 rounded-xl border border-zinc-900 flex flex-col gap-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">DB Row ID:</span>
                        <span className="font-mono text-zinc-300 truncate max-w-[150px]">{dbRecord.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Synced Name:</span>
                        <span className="text-zinc-300 font-medium">{dbRecord.name}</span>
                      </div>
                      {dbRecord.email && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Synced Email:</span>
                          <span className="text-zinc-300">{dbRecord.email}</span>
                        </div>
                      )}
                      {dbRecord.phone_number && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Synced Phone:</span>
                          <span className="text-zinc-300">{dbRecord.phone_number}</span>
                        </div>
                      )}
                      {dbRecord.auth_provider && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Provider:</span>
                          <span className="text-zinc-300 capitalize">{dbRecord.auth_provider}</span>
                        </div>
                      )}
                      {dbRecord.verification_method && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Channel OTP:</span>
                          <span className="text-zinc-300 capitalize">{dbRecord.verification_method}</span>
                        </div>
                      )}
                      {dbRecord.last_login_at && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Last Login:</span>
                          <span className="text-zinc-300">{new Date(dbRecord.last_login_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 py-1">
                    <div className="flex items-center gap-2 text-xs text-yellow-400 font-semibold">
                      <span className="h-2 w-2 bg-yellow-400 rounded-full animate-ping" />
                      <span>Sync Pending</span>
                    </div>
                    <button
                      onClick={async () => {
                        setDbLoading(true);
                        await insforge.database.from("users").insert([{ id: user.id, email: user.email, name: user.profile?.name || user.email.split("@")[0] }]);
                        const { data } = await insforge.database.from("users").select("*").eq("id", user.id);
                        if (data && data.length > 0) setDbRecord(data[0] as DbUserRecord);
                        setDbLoading(false);
                      }}
                      className="w-full text-center text-xs font-semibold py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-850 hover:text-white transition-colors"
                    >
                      Manually Sync Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Agent */}
        {activeTab === "ai-agent" && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white">OmniSync AI Agent Runner</h1>
                <p className="text-sm text-zinc-400 font-sans mt-1">Execute natural language agent commands across Gmail MCP, Sent.dm WhatsApp/SMS dispatcher, and InsForge BaaS.</p>
              </div>
              <div className="flex items-center gap-2 bg-neutral-900 border border-zinc-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Agent Engine Active</span>
              </div>
            </div>
            
            {/* Interactive Agent Console Input */}
            <div className="glassmorphism-card rounded-2xl p-6 border border-zinc-850 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Agent Prompt Console</span>
                <span className="text-[10px] text-zinc-500 font-mono">Bound Account: {user?.email || "bnk.avik@gmail.com"}</span>
              </div>

              {/* Preset Command Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider self-center mr-1">Quick Prompts:</span>
                <button
                  onClick={() => runAgentCommand("Summarize my unread emails from Gmail inbox")}
                  className="text-[11px] font-semibold bg-neutral-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  📩 Summarize Gmail Inbox
                </button>
                <button
                  onClick={() => runAgentCommand("Dispatch a WhatsApp OTP alert code to +15550192834 via Sent.dm")}
                  className="text-[11px] font-semibold bg-neutral-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  📱 Send WhatsApp/SMS Alert
                </button>
                <button
                  onClick={() => runAgentCommand("Generate a complete workspace daily briefing digest")}
                  className="text-[11px] font-semibold bg-neutral-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  📋 Daily Briefing Digest
                </button>
              </div>

              {/* Prompt Input Form */}
              <div className="flex gap-3 mt-1">
                <input
                  type="text"
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runAgentCommand()}
                  placeholder="Ask agent to check emails, dispatch WhatsApp message, or compile briefing..."
                  className="flex-1 bg-neutral-950 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors font-sans placeholder:text-zinc-600"
                />
                <button
                  onClick={() => runAgentCommand()}
                  disabled={agentRunning || !agentPrompt.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2 text-sm shadow-lg shadow-indigo-600/20"
                >
                  {agentRunning ? (
                    <>
                      <span className="animate-spin text-xs">🌀</span>
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Agent</span>
                      <span>➔</span>
                    </>
                  )}
                </button>
              </div>

              {/* Agent Output Terminal Window */}
              {agentResult && (
                <div className="mt-2 rounded-xl border border-indigo-500/30 bg-neutral-950/90 p-5 font-mono text-xs animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">●</span>
                      <span className="text-white font-bold">Execution Output</span>
                    </div>
                    <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/40 font-bold uppercase">
                      {agentResult.toolCalled}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap text-zinc-300 font-sans leading-relaxed text-sm">
                    {agentResult.response}
                  </pre>
                </div>
              )}
            </div>

            {/* Agent Logs Table from InsForge Database */}
            <div className="glassmorphism-card rounded-2xl p-6 border border-zinc-850 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">InsForge Database Agent Logs</h3>
                <span className="text-[10px] text-zinc-500 font-mono">{agentLogs.length} Execution Records</span>
              </div>

              {agentLogs.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center font-sans">No previous agent logs found. Run a prompt above to record tool executions in PostgreSQL.</p>
              ) : (
                <div className="space-y-3">
                  {agentLogs.map((log: any) => (
                    <div key={log.id} className="p-3.5 bg-neutral-950 rounded-xl border border-zinc-900 flex items-center justify-between gap-4 font-sans">
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] bg-zinc-850 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">{log.tool_called}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-white font-semibold truncate">{log.prompt}</p>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/40 border border-emerald-900/40 px-2 py-1 rounded shrink-0">Logged</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Briefing */}
        {activeTab === "briefing" && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-3xl font-extrabold text-white">Daily Briefing</h1>
            <p className="text-sm text-zinc-400 font-sans">Get a unified summary of your workspace communication channels. Our agents read and compile summaries so you never miss anything important.</p>
            
            <div className="p-8 rounded-2xl glassmorphism-card border border-zinc-850 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-900 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Ready
              </div>
              <div className="border-b border-zinc-900 pb-4">
                <span className="text-xs text-zinc-500 block">July 17, 2026</span>
                <h3 className="text-xl font-bold text-white mt-1">Morning Summary Overview</h3>
              </div>
              <div className="space-y-4 text-sm text-zinc-350 leading-relaxed font-sans">
                <p>
                  <strong>Gmail Synthesis:</strong> Sarah requested John to deliver the roadmap slides prior to Monday's kickoff sync meeting at 2:00 PM EST.
                </p>
                <p>
                  <strong>WhatsApp Alert:</strong> David Miller texted confirming he has arrived and requested hotel address coordinates. Dinner plans are set for tonight at 8:00 PM.
                </p>
                <p>
                  <strong>Telegram System Alerts:</strong> Host cpu warning reported prod-api-04 exceeding 92% threshold, scaling triggered automatically.
                </p>
              </div>
              <button className="w-full mt-4 text-center text-xs font-bold py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black rounded-xl transition-colors cursor-pointer">
                Regenerate Briefing
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Integrations */}
        {activeTab === "integrations" && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white font-sans">Channel Integrations</h1>
                <p className="text-sm text-zinc-400 mt-1">Connect platforms to deploy active monitoring AI agents via MCP tools.</p>
              </div>
            </div>

            {loadingIntegrations ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {platformsList.map((platform) => {
                  const isConnected = connectedPlatforms.includes(platform.id);
                  return (
                    <div 
                      key={platform.id} 
                      className="glassmorphism-card rounded-2xl p-6 border border-zinc-850 flex flex-col items-center justify-between text-center relative overflow-hidden h-[300px] group transition-all duration-300 hover:border-zinc-700/80 hover:shadow-lg"
                    >
                      {/* Connection status indicator */}
                      {isConnected && (
                        <span className="absolute top-3 right-3 text-[9px] bg-emerald-950 border border-emerald-900/60 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Connected
                        </span>
                      )}

                      {/* Logo container (centered) */}
                      <div className="flex-1 flex items-center justify-center pt-2">
                        <div className="p-3 bg-neutral-900/60 border border-zinc-850 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                          <img src={platform.logoSrc} className="h-10 w-10 opacity-70 group-hover:opacity-100 transition-opacity animate-float" alt={platform.name} />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="mt-3 w-full">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{platform.name}</h3>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 h-9 leading-relaxed max-w-[240px] mx-auto font-sans">
                          {platform.description}
                        </p>
                      </div>

                      {/* Bottom Toggles */}
                      <div className="w-full flex gap-2.5 mt-5">
                        {isConnected ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPlatform(platform);
                                setIsSettingsOpen(true);
                              }}
                              className="flex-1 text-[11px] font-bold py-2 bg-neutral-900 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
                            >
                              Settings
                            </button>
                            <button
                              onClick={() => handleDisconnect(platform.id)}
                              className="flex-1 text-[11px] font-bold py-2 bg-red-950/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-950/40 transition-all cursor-pointer"
                            >
                              Disconnect
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleConnect(platform.id)}
                            className="w-full text-[11px] font-bold py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer shadow shadow-indigo-500/10"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Alerts */}
        {activeTab === "alerts" && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-3xl font-extrabold text-white">Alert Log</h1>
            <p className="text-sm text-zinc-400 font-sans">Real-time alerts flagged by connected channels and auto-processed parameters.</p>
            
            <div className="glassmorphism-card rounded-2xl p-6 border border-zinc-850">
              <div className="space-y-4">
                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 text-lg">🚨</span>
                    <div>
                      <span className="text-xs font-bold text-white block">prod-api-04 High CPU usage warning</span>
                      <span className="text-[10px] text-zinc-500">Telegram Bot alert</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-red-400 font-semibold px-2 py-0.5 rounded bg-red-950 border border-red-900/40">Critical</span>
                </div>
                <div className="p-4 bg-yellow-950/20 border border-yellow-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400 text-lg">⚠️</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Unresolved roadmap checklist item due tomorrow</span>
                      <span className="text-[10px] text-zinc-500">Gmail thread follow-up</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-yellow-400 font-semibold px-2 py-0.5 rounded bg-yellow-950 border border-yellow-900/40">Urgent</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Settings */}
        {activeTab === "settings" && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-3xl font-extrabold text-white">Workspace Settings</h1>
            <p className="text-sm text-zinc-400">Configure parameters for agent behaviors, schedule sync intervals, and notifications profiles.</p>
            
            <div className="glassmorphism-card rounded-2xl p-6 border border-zinc-850 flex flex-col gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Agent Sync Frequency</label>
                <select className="w-full glassmorphism-input px-4 py-3 rounded-xl text-sm text-white font-sans">
                  <option>Real-time (Auto-sync)</option>
                  <option>Every 15 minutes</option>
                  <option>Hourly</option>
                  <option>Daily</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Data Privacy Level</label>
                <select className="w-full glassmorphism-input px-4 py-3 rounded-xl text-sm text-white font-sans">
                  <option>Sandbox isolated (Maximum encryption)</option>
                  <option>Standard compliance</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Pricing Settings */}
        {activeTab === "pricing" && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-3xl font-extrabold text-white">Pricing & Workspace Plans</h1>
            <p className="text-sm text-zinc-400 font-sans">Currently subscribed tier and billing configurations.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Current Tier */}
              <div className="glassmorphism-card rounded-2xl p-6 border border-zinc-850 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-bold uppercase">
                  Active
                </div>
                <h3 className="text-lg font-bold text-white">Free Sandbox Plan</h3>
                <p className="text-xs text-zinc-500">Ideal for testing out integrations and simulating custom AI agent summaries.</p>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-3xl font-bold text-white">$0</span>
                  <span className="text-xs text-zinc-500">/ month</span>
                </div>
              </div>

              {/* Upgrade option */}
              <div className="glassmorphism-card rounded-2xl p-6 border border-indigo-500/20 bg-indigo-950/5 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded font-bold uppercase">
                  Recommended
                </div>
                <h3 className="text-lg font-bold text-white">Professional Agent Plan</h3>
                <p className="text-xs text-zinc-500">Deploy infinite background agents, full WhatsApp/Telegram OTP syncs, and advanced roadmaps.</p>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-3xl font-bold text-white">$19</span>
                  <span className="text-xs text-zinc-500">/ month</span>
                </div>
                <button className="w-full mt-2 text-center text-xs font-bold py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-650 hover:to-purple-650 text-white rounded-xl transition-all shadow-md cursor-pointer">
                  Upgrade Workspace
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Platform Settings Dialog (Clean Available MCP Tools View) */}
      {isSettingsOpen && selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`rounded-2xl max-w-3xl w-full border shadow-2xl p-6 sm:p-8 relative flex flex-col max-h-[85vh] overflow-hidden ${
            theme === "light"
              ? "bg-white text-zinc-900 border-zinc-200 shadow-2xl"
              : "glassmorphism-card text-zinc-100 border-zinc-800 shadow-black/80"
          }`}>
            
            {/* Header Bar */}
            <div className="flex items-center justify-between pb-5 border-b border-zinc-800/40">
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-2xl border ${
                  theme === "light" ? "bg-zinc-100 border-zinc-200" : "bg-neutral-900 border-zinc-800"
                }`}>
                  <img src={selectedPlatform.logoSrc} className="h-8 w-8" alt={selectedPlatform.name} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold tracking-tight">{selectedPlatform.name} MCP Settings</h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-900/60 uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Registered Model Context Protocol (MCP) tools and available agent capabilities.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  setSelectedPlatform(null);
                }}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer text-xs font-bold ${
                  theme === "light"
                    ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700"
                    : "bg-neutral-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                ✕ Close
              </button>
            </div>

            {/* Scrollable Content: Available MCP Tools & Actions */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              
              {/* Description summary */}
              <div>
                <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Platform Summary</h4>
                <p className="text-xs leading-relaxed font-sans text-zinc-400">{selectedPlatform.description}</p>
              </div>

              {/* Tools list */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                    Available MCP Tools & Actions ({selectedPlatform.mcpTools.length})
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    JSON-RPC 2.0 Ready
                  </span>
                </div>

                <div className="space-y-3.5">
                  {selectedPlatform.mcpTools.map((tool: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                        theme === "light"
                          ? "bg-zinc-50/80 border-zinc-200 hover:border-zinc-300"
                          : "bg-neutral-950/80 border-zinc-850 hover:border-zinc-800"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-indigo-400 font-bold">{tool.name}</span>
                        <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded font-mono font-bold uppercase">
                          Tool
                        </span>
                      </div>
                      <p className="text-xs font-sans leading-relaxed text-zinc-400">{tool.description}</p>
                      <div className="text-[10px] flex gap-1.5 font-mono pt-1 border-t border-zinc-800/30">
                        <span className="text-zinc-500 font-bold">Parameters:</span>
                        <span className="text-indigo-400 font-semibold">{tool.params || "None"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
