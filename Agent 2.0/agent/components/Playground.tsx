"use client";

import { useState, useEffect } from "react";

type IntegrationKey = "gmail" | "whatsapp" | "telegram" | "outlook";

interface MockData {
  sender: string;
  avatar: string;
  time: string;
  platform: string;
  rawMessage: string;
  summary: string;
  reminders: string[];
  replyDraft: string;
  themeColor: string;
}

const MOCK_INTEGRATIONS: Record<IntegrationKey, MockData> = {
  gmail: {
    sender: "Sarah Jenkins (Project Lead)",
    avatar: "S",
    time: "10 mins ago",
    platform: "Gmail",
    rawMessage: "Hi Team, thanks for the feedback on the product roadmap. Let's schedule the kickoff meeting for Monday at 2 PM EST. Also, John, please share the updated slide deck before then. Thanks! - Sarah",
    summary: "Sarah proposes a project kickoff meeting on Monday at 2:00 PM EST and requests an updated slide deck from John prior to the meeting.",
    reminders: [
      "🗓️ Kickoff Meeting: Monday at 2:00 PM EST",
      "📝 John: Share updated slide deck (Due Sunday)",
      "✉️ Draft email reply: Confirm kickoff attendance"
    ],
    replyDraft: "Hi Sarah, thanks for coordinating! I've added the meeting to my calendar and John is finalizing the slide deck to send over by Sunday. See you Monday!",
    themeColor: "from-red-500/20 to-red-600/5 border-red-500/30 text-red-400"
  },
  whatsapp: {
    sender: "David Miller (Client)",
    avatar: "D",
    time: "2 mins ago",
    platform: "WhatsApp",
    rawMessage: "Hey! Just landed. Can you send me the address of the hotel again? Also, are we still on for dinner tonight at 8? Let me know!",
    summary: "David has arrived at his destination. He requests the hotel address and confirmation for tonight's dinner plans at 8:00 PM.",
    reminders: [
      "📍 Send hotel address to David",
      "🍽️ Confirm dinner plans: Tonight at 8:00 PM"
    ],
    replyDraft: "Hey David, welcome! Here is the hotel address: 725 Premium Way, Suite A. Yes, we are locked in for dinner at 8 PM at Chez Bistro. See you soon!",
    themeColor: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400"
  },
  telegram: {
    sender: "SysOps Monitoring Bot",
    avatar: "🤖",
    time: "Just now",
    platform: "Telegram",
    rawMessage: "🚨 Server Alert: CPU usage on instance 'prod-api-04' exceeded 92% for 5 consecutive minutes. Auto-scaling has been successfully triggered.",
    summary: "High CPU load alert (92%) on prod-api-04. Auto-scaling action was initiated automatically by system protocols.",
    reminders: [
      "💻 Check CloudWatch logs for prod-api-04 load source",
      "🔍 Verify new auto-scaled instance health status"
    ],
    replyDraft: "/ack alert_id=98831. Escalating to engineering team channel.",
    themeColor: "from-sky-500/20 to-sky-600/5 border-sky-500/30 text-sky-400"
  },
  outlook: {
    sender: "Robert Vance (CFO)",
    avatar: "R",
    time: "1 hour ago",
    platform: "Outlook",
    rawMessage: "Dear Team, the quarterly board review is scheduled for next Thursday. Please prepare the financial summary report and ensure all budget spreadsheets are updated in the shared OneDrive folder by Tuesday end of day. Best regards, Robert.",
    summary: "Robert requests the financial summary report and updated OneDrive budget spreadsheets by next Tuesday EOD in preparation for Thursday's board review.",
    reminders: [
      "📊 Prepare Q3 financial summary report",
      "📂 Update budget spreadsheets in OneDrive (Due Tuesday EOD)",
      "🗓️ Board Review Meeting: Next Thursday"
    ],
    replyDraft: "Dear Robert, I will compile the financial summary report and have all budget spreadsheets updated in the OneDrive folder by Tuesday afternoon. Sincerely, Avik.",
    themeColor: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400"
  }
};

export default function Playground() {
  const [activePlatform, setActivePlatform] = useState<IntegrationKey>("gmail");
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<IntegrationKey, boolean>>({
    gmail: true,
    whatsapp: false,
    telegram: false,
    outlook: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [reminderSaved, setReminderSaved] = useState<Record<string, boolean>>({});

  // Simulate AI agent analysis on change of active platform
  useEffect(() => {
    setIsProcessing(true);
    setProcessingStep(0);
    
    const timers = [
      setTimeout(() => setProcessingStep(1), 600),
      setTimeout(() => setProcessingStep(2), 1200),
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStep(3);
      }, 1800)
    ];

    return () => timers.forEach(clearTimeout);
  }, [activePlatform]);

  const toggleConnect = (platform: IntegrationKey, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleSaveReminder = (item: string) => {
    setReminderSaved(prev => ({ ...prev, [item]: true }));
    setTimeout(() => {
      setReminderSaved(prev => ({ ...prev, [item]: false }));
    }, 2000);
  };

  const activeData = MOCK_INTEGRATIONS[activePlatform];

  return (
    <section id="playground" className="relative py-24 sm:py-32 overflow-hidden radial-grid">
      <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-base font-semibold uppercase tracking-wider text-indigo-400">
            Interactive Playground
          </h2>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
            See the AI Agent in Action
          </p>
          <p className="mt-4 text-lg text-zinc-400">
            Select a communications channel, simulate connecting your account, and watch our autonomous AI agents compile insights instantly.
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Channels list */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-zinc-300 px-1 mb-2">Connect Channels</h3>
            
            {(Object.keys(MOCK_INTEGRATIONS) as IntegrationKey[]).map((key) => {
              const data = MOCK_INTEGRATIONS[key];
              const isSelected = activePlatform === key;
              const isConnected = connectedPlatforms[key];

              return (
                <div
                  key={key}
                  onClick={() => setActivePlatform(key)}
                  className={`group relative flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "glassmorphism-card border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                      : "bg-neutral-900/40 border border-zinc-800/50 hover:border-zinc-700/80 hover:bg-neutral-900/60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon mapping */}
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                      isSelected ? "bg-indigo-500/10 text-indigo-400" : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-300"
                    }`}>
                      {key === "gmail" && (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                      )}
                      {key === "whatsapp" && (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.004 2c-5.518 0-9.996 4.477-9.996 9.996 0 1.764.46 3.42 1.265 4.869l-1.344 4.912 5.023-1.317c1.4.763 2.99 1.163 4.629 1.163 5.518 0 10.021-4.477 10.021-9.996 0-5.519-4.503-9.996-10.021-9.996zm6.657 14.161c-.273.766-1.571 1.393-2.154 1.455-.494.053-1.139.079-1.821-.137-.428-.135-.972-.326-1.637-.611-2.83-1.217-4.664-4.102-4.805-4.292-.143-.189-1.148-1.533-1.148-2.923 0-1.391.727-2.076.987-2.348.26-.272.571-.34.767-.34.195 0 .39.002.56.01.177.009.414-.067.65.503.242.585.83 2.034.902 2.181.072.146.12.316.022.512-.097.195-.146.316-.293.487-.146.171-.307.382-.439.513-.146.146-.3.305-.129.598.171.293.76 1.253 1.632 2.031.928.828 1.71 1.084 1.954 1.205.244.121.385.102.527-.061.143-.162.612-.714.775-.957.163-.244.325-.203.548-.122.222.081 1.411.666 1.655.788.244.122.406.183.466.284.061.101.061.587-.212 1.353z" />
                        </svg>
                      )}
                      {key === "telegram" && (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.6 1.5-1.57 2.76-2.99 2.82-3.23.01-.05 0-.2-.08-.27-.08-.07-.2-.05-.29-.03-.12.02-2.11 1.34-5.96 3.93-.57.39-1.08.57-1.55.56-.51-.01-1.49-.29-2.22-.53-.9-.29-1.61-.45-1.55-.95.03-.26.39-.52 1.08-.8 4.22-1.84 7.04-3.05 8.46-3.64 4.02-1.68 4.86-1.97 5.4-.98.12.22.12.44.08.76z" />
                        </svg>
                      )}
                      {key === "outlook" && (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.5 12.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-4.5C9.67 11 9 10.33 9 9.5S9.67 8 10.5 8 12 8.67 12 9.5s-.67 1.5-1.5 1.5zM18 15h-4v-1h4v1zm0-3h-4v-1h4v1zm0-3h-4V8h4v1z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white capitalize">{data.platform}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {isConnected ? "Connected • Active Agent" : "Click to mock connection"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleConnect(key, e)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                      isConnected
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20"
                        : "bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                    }`}
                  >
                    {isConnected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right panel: Processing display */}
          <div className="lg:col-span-7">
            <div className="glassmorphism-card rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
              
              {/* Top bar */}
              <div className="bg-neutral-900 px-6 py-4 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 block" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80 block" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest ml-2">
                    AI Agentic Processing Panel
                  </span>
                </div>
                
                {/* Connected indicator */}
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${connectedPlatforms[activePlatform] ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`} />
                  <span className="text-xs font-medium text-zinc-400 capitalize">
                    {connectedPlatforms[activePlatform] ? "Sync active" : "Not connected"}
                  </span>
                </div>
              </div>

              {/* Message Details */}
              <div className="p-6 flex flex-col gap-6">
                
                {/* Incoming Feed Row */}
                <div className="flex flex-col gap-2 bg-neutral-950/80 p-4 rounded-xl border border-zinc-900">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-200">
                        {activeData.avatar}
                      </div>
                      <span className="font-semibold">{activeData.sender}</span>
                    </div>
                    <span className="text-zinc-500">{activeData.time}</span>
                  </div>
                  <div className="mt-2 text-sm text-zinc-400 italic font-sans leading-relaxed">
                    "{activeData.rawMessage}"
                  </div>
                </div>

                {/* AI Agent Step Progression */}
                <div className="flex flex-col gap-3 min-h-[70px]">
                  {isProcessing ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2.5 text-xs text-indigo-400">
                        <svg className="animate-spin h-3 w-3 text-indigo-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="font-medium animate-pulse">
                          {processingStep === 0 && "Parsing incoming message structure..."}
                          {processingStep === 1 && "Analyzing content and extracting entities..."}
                          {processingStep === 2 && "Synthesizing dynamic reminders and context draft..."}
                        </span>
                      </div>
                      
                      {/* Simulated loading bar */}
                      <div className="w-full bg-zinc-900 rounded-full h-1">
                        <div 
                          className="bg-indigo-500 h-1 rounded-full transition-all duration-500" 
                          style={{ width: `${(processingStep + 1) * 33}%` }} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold">Analysis complete. Reminders and summary successfully compiled.</span>
                    </div>
                  )}
                </div>

                {/* Final AI Output Panel */}
                <div className={`transition-all duration-500 flex flex-col gap-6 ${isProcessing ? "opacity-20 blur-[1px] pointer-events-none scale-[0.99]" : "opacity-100 blur-0 scale-100"}`}>
                  
                  {/* Summary Card */}
                  <div className="bg-neutral-900/60 p-5 rounded-xl border border-zinc-800/80">
                    <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
                      Structured Summary
                    </h5>
                    <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                      {activeData.summary}
                    </p>
                  </div>

                  {/* Actions & Reminders */}
                  <div className="flex flex-col gap-3">
                    <h5 className="text-xs font-bold text-purple-400 uppercase tracking-widest px-1">
                      Action Items & Calendar Reminders
                    </h5>
                    <div className="flex flex-col gap-2">
                      {activeData.reminders.map((reminder, idx) => {
                        const isSaved = reminderSaved[reminder] || false;
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/60 border border-zinc-900 text-sm text-zinc-300 hover:border-zinc-800 transition-colors"
                          >
                            <span className="font-medium text-zinc-200">{reminder}</span>
                            <button
                              onClick={() => handleSaveReminder(reminder)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded transition-all ${
                                isSaved 
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700"
                              }`}
                            >
                              {isSaved ? "Saved ✓" : "Sync"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Draft Response */}
                  <div className="bg-neutral-900/40 p-5 rounded-xl border border-zinc-800/80 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                        Draft AI Response
                      </h5>
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full font-bold border border-cyan-800/50">
                        Context Aware
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 bg-neutral-950/60 p-3 rounded-lg border border-zinc-900 font-mono leading-relaxed">
                      {activeData.replyDraft}
                    </div>
                    <div className="flex justify-end gap-2.5">
                      <button className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all">
                        Edit Draft
                      </button>
                      <button className="text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1.5 rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-600 transition-all">
                        Send Reply
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
