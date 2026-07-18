"use client";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden radial-grid">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-lines opacity-30 pointer-events-none" />

      {/* Floating abstract blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 mb-8 animate-fade-in shadow-md">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Introducing Personal Agent v2.0 Workspace</span>
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-none font-sans max-w-5xl mx-auto">
          Personal Agent — Your Hub for{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 font-black">
            Messages & Tasks
          </span>
        </h1>

        {/* Subheading with Purpose Explanation */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-400 font-sans max-w-3xl mx-auto leading-relaxed">
          Personal Agent is an AI personal assistant application that connects your communication channels (including Gmail, WhatsApp via Sent.dm, Telegram, and Outlook). Personal Agent automatically compiles unread message summaries, extracts actionable task reminders, and generates intelligent briefing digests on your behalf.
        </p>

        {/* Purpose Explanation Banner for Google Cloud Verification */}
        <div className="mt-8 max-w-3xl mx-auto p-4 rounded-2xl bg-neutral-900/80 border border-zinc-800 text-left text-xs text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-indigo-400 text-lg">💡</span>
            <div>
              <span className="font-bold text-white block">Application Purpose & Data Usage Notice</span>
              <span className="text-zinc-400">Personal Agent requests read-only Google data access strictly to analyze unread email headers and body snippets to build your daily summary digest.</span>
            </div>
          </div>
          <a href="/privacy" className="text-indigo-400 font-bold hover:underline shrink-0 text-xs">Read Privacy Policy →</a>
        </div>

        {/* CTA Actions */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="/signup"
            className="w-full sm:w-auto relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-semibold text-white rounded-xl group bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-cyan-400 hover:text-white transition-all duration-300 shadow-xl shadow-indigo-500/10 cursor-pointer"
          >
            <span className="w-full sm:w-auto relative px-8 py-3.5 transition-all ease-in duration-75 bg-neutral-950 rounded-[10px] group-hover:bg-opacity-0">
              Start Free Today
            </span>
          </a>
          <a
            href="#playground"
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white px-8 py-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-neutral-900/40 hover:bg-neutral-900/60 transition-all cursor-pointer"
          >
            <span>Try Interactive Demo</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Interactive Hub Dashboard Preview Graphic */}
        <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-zinc-800 bg-neutral-950/80 p-4 sm:p-6 shadow-2xl shadow-black/80">
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10 rounded-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Agent Dashboard Sandbox preview</span>
            <div className="w-14" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-0">
            {/* Inbox column */}
            <div className="bg-neutral-900/50 rounded-xl p-4 border border-zinc-900 text-left">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Live Feed</span>
                <span className="text-[9px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded font-bold">4 Channels</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-3 bg-neutral-950 rounded-lg border border-zinc-900 flex flex-col gap-1.5 opacity-90">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span className="font-semibold text-red-400">Gmail</span>
                    <span>5m ago</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 truncate">"Can John send the slides for Monday's kickoff..."</p>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-zinc-900 flex flex-col gap-1.5 opacity-95">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span className="font-semibold text-emerald-400">WhatsApp</span>
                    <span>10m ago</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 truncate">"Dinner still on for tonight at 8?"</p>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-zinc-900 flex flex-col gap-1.5 opacity-60">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span className="font-semibold text-sky-400">Telegram</span>
                    <span>30m ago</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 truncate">"🚨 Server Alert: CPU exceeds 92%"</p>
                </div>
              </div>
            </div>

            {/* AI Agent Processing column */}
            <div className="bg-neutral-900/50 rounded-xl p-4 border border-zinc-900 flex flex-col justify-center items-center text-center relative overflow-hidden">
              <div className="absolute top-4 left-4 text-xs font-bold text-zinc-400 uppercase tracking-wide">Orchestrator</div>
              
              <div className="relative h-20 w-20 bg-indigo-500/10 rounded-full border border-indigo-500/30 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className="absolute -inset-1 rounded-full border border-indigo-500/10 animate-ping pointer-events-none" />
              </div>
              
              <h4 className="text-xs font-bold text-white">AI Agent Active</h4>
              <p className="text-[10px] text-zinc-500 mt-1 max-w-[180px]">
                Structuring updates and compiling follow-ups in the background.
              </p>
            </div>

            {/* Compiled Tasks/Outputs column */}
            <div className="bg-neutral-900/50 rounded-xl p-4 border border-zinc-900 text-left">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Synced Actions</span>
                <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Auto-sync</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-neutral-950 rounded border border-zinc-900 flex items-center gap-2">
                  <span className="text-xs">🗓️</span>
                  <div>
                    <span className="text-[10px] font-semibold text-white block">Kickoff: Mon 2pm</span>
                    <span className="text-[8px] text-zinc-500">Google Calendar</span>
                  </div>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded border border-zinc-900 flex items-center gap-2">
                  <span className="text-xs">📝</span>
                  <div>
                    <span className="text-[10px] font-semibold text-white block">John: Send Slide Deck</span>
                    <span className="text-[8px] text-zinc-500">OmniSync Reminders</span>
                  </div>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded border border-zinc-900 flex items-center gap-2">
                  <span className="text-xs">✉️</span>
                  <div>
                    <span className="text-[10px] font-semibold text-white block">Reply Draft: Robert Vance</span>
                    <span className="text-[8px] text-zinc-500">Ready to review</span>
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
