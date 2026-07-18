"use client";

import { useState } from "react";

export default function Features() {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  const steps = [
    {
      title: "1. Connect Accounts",
      desc: "Link Gmail, WhatsApp, Telegram, and Outlook with bank-grade 256-bit encryption in just a single click.",
      badge: "Fast & Secure"
    },
    {
      title: "2. Autonomous Processing",
      desc: "Our AI agents monitor incoming feeds, filter noise, and identify actionable requests or items.",
      badge: "Real-time AI"
    },
    {
      title: "3. Actionable Outputs",
      desc: "Get elegant summaries, automated task reminders, and high-fidelity smart draft replies automatically.",
      badge: "Zero Effort"
    }
  ];

  return (
    <section id="features" className="py-24 sm:py-32 relative overflow-hidden bg-neutral-950/20">
      
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <h2 className="text-base font-semibold uppercase tracking-wider text-indigo-400">
            Platform Capabilities
          </h2>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            A Smarter Way to Manage Communication
          </p>
          <p className="mt-4 text-lg text-zinc-400">
            Traditional tools leave you drowning in notifications. OmniSync AI deploys specialized, autonomous agents that streamline your digital life.
          </p>
        </div>

        {/* Feature 1: Alternating Layout (Text Left, Visual Right) */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center py-12 border-b border-zinc-900">
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-6">
              <span>★</span> Intelligent Summarization
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Distill hours of reading into seconds of clarity
            </h3>
            <p className="mt-4 text-zinc-400 leading-relaxed text-base font-sans">
              Our agents read long email threads, chat logs, and messaging history to construct a cohesive view of your day. No more searching through dozens of messages to figure out what someone needs.
            </p>
            
            {/* Value bullets */}
            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold shrink-0">✓</span>
                <span className="text-zinc-300 text-sm font-medium">Cross-channel synthesis (e.g. Gmail thread connected to WhatsApp chats)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold shrink-0">✓</span>
                <span className="text-zinc-300 text-sm font-medium">Sentiment analysis to flag urgent messages from key stakeholders</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold shrink-0">✓</span>
                <span className="text-zinc-300 text-sm font-medium">Customizable lengths (one-liner alerts up to exhaustive updates)</span>
              </li>
            </ul>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="glassmorphism-card rounded-2xl p-6 border border-zinc-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">AI Summarization Flow</span>
                <span className="text-xs text-zinc-500">Processing live feed...</span>
              </div>
              
              <div className="flex flex-col gap-4">
                {/* Long Source Message Mockup */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-zinc-800 text-xs text-zinc-500 font-sans leading-relaxed relative">
                  <div className="absolute top-2 right-2 text-[10px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-800/40">Raw Email Thread</div>
                  <span className="font-semibold text-zinc-300 block mb-1">From: CEO Office (Robert Vance)</span>
                  "Team, for the launch next week we need to finalize the landing screen copy. Avik is leading that. Let's make sure the designers review it by Friday, and please have the marketing draft done. Also, we will sync on Monday morning at 9:00 AM..."
                </div>
                
                {/* Arrow indicator */}
                <div className="flex justify-center my-1 text-indigo-400">
                  <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                  </svg>
                </div>

                {/* Summarized Mockup */}
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-zinc-200 font-sans leading-relaxed">
                  <span className="font-bold text-indigo-400 block mb-1">✓ AI Agent Summary (12s elapsed)</span>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span><strong>Avik</strong> needs to finalize the landing screen copy.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>Designers review copy by <strong>Friday</strong>; marketing draft due.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>Monday morning sync scheduled at <strong>9:00 AM</strong>.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Alternating Layout (Visual Left, Text Right) */}
        <div className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-20 items-center py-20 border-b border-zinc-900">
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20 mb-6">
              <span>⚡</span> Proactive Reminder Engine
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Turn passive messages into active reminders
            </h3>
            <p className="mt-4 text-zinc-400 leading-relaxed text-base font-sans">
              Instead of manually updating calendar appointments or writing sticky notes, OmniSync AI reads casual arrangements and schedules them for you. It monitors WhatsApp deadlines, Telegram requests, and Outlook meetings.
            </p>
            
            {/* Value bullets */}
            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold shrink-0">✓</span>
                <span className="text-zinc-300 text-sm font-medium">Automatic Google and Outlook calendar event scheduling</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold shrink-0">✓</span>
                <span className="text-zinc-300 text-sm font-medium">Real-time alerts via push notification or directly inside WhatsApp/Telegram</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold shrink-0">✓</span>
                <span className="text-zinc-300 text-sm font-medium">Smart follow-up alerts when emails go unanswered by critical deadlines</span>
              </li>
            </ul>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="glassmorphism-card rounded-2xl p-6 border border-zinc-800 shadow-2xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Dynamic Schedule Sync</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40">Synced</span>
              </div>
              
              {/* Task list simulation */}
              <div className="flex flex-col gap-3">
                
                {/* Task Item 1 */}
                <div className="flex items-center justify-between p-3.5 bg-neutral-900/90 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-purple-500/10 text-purple-400 text-xs">📅</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Monday Sync Meeting</span>
                      <span className="text-[10px] text-zinc-500">Detected from Robert's Outlook email</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded">Monday, 9:00 AM</span>
                </div>

                {/* Task Item 2 */}
                <div className="flex items-center justify-between p-3.5 bg-neutral-900/90 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/10 text-indigo-400 text-xs">💬</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Send address to David</span>
                      <span className="text-[10px] text-zinc-500">Detected from David's WhatsApp text</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-indigo-950/60 text-indigo-400 px-2 py-1 rounded border border-indigo-900/40">Urgent</span>
                </div>

                {/* Task Item 3 */}
                <div className="flex items-center justify-between p-3.5 bg-neutral-900/90 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/10 text-cyan-400 text-xs">🚀</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Design Review Checklist</span>
                      <span className="text-[10px] text-zinc-500">Detected from roadmap update thread</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded">Due Friday</span>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Interactive Narrative Walkthrough (Narrative Flow, Not Grid) */}
        <div id="workflow" className="py-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 mb-6">
              <span>✦</span> How it works
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Setting up your assistant is a breeze
            </h3>
            <p className="mt-4 text-zinc-400 text-sm">
              We've engineered OmniSync AI to configure easily in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Step navigation */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {steps.map((step, idx) => {
                const isActive = activeWorkflowStep === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveWorkflowStep(idx)}
                    className={`p-5 rounded-2xl cursor-pointer border transition-all duration-300 ${
                      isActive
                        ? "glassmorphism-card border-cyan-500/40 bg-neutral-900/60 shadow-lg shadow-cyan-500/5"
                        : "bg-transparent border-transparent hover:border-zinc-800 hover:bg-neutral-900/20"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className={`text-base font-bold transition-colors ${isActive ? "text-cyan-400" : "text-zinc-400"}`}>
                        {step.title}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isActive ? "bg-cyan-950 text-cyan-400 border border-cyan-800" : "bg-zinc-900 text-zinc-500"
                      }`}>
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-2 font-sans leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Step Visual Sandbox */}
            <div className="lg:col-span-7">
              <div className="glassmorphism-card rounded-2xl p-8 border border-zinc-800 min-h-[350px] flex flex-col justify-center relative overflow-hidden shadow-2xl">
                
                {/* Background overlay details */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

                {/* Step 1 Visual */}
                {activeWorkflowStep === 0 && (
                  <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex gap-4 mb-8">
                      {["gmail", "whatsapp", "telegram", "outlook"].map((p, i) => (
                        <div key={i} className="h-14 w-14 rounded-2xl bg-neutral-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-lg animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                          {p === "gmail" && <span className="text-2xl">✉️</span>}
                          {p === "whatsapp" && <span className="text-2xl">💬</span>}
                          {p === "telegram" && <span className="text-2xl">✈️</span>}
                          {p === "outlook" && <span className="text-2xl">📅</span>}
                        </div>
                      ))}
                    </div>
                    <h4 className="text-lg font-bold text-white">Select and Authenticate</h4>
                    <p className="text-xs text-zinc-500 mt-2 max-w-sm">
                      We support OAuth2.0 standard passwordless logins. We never store credentials and can't read files or messages without permission.
                    </p>
                    <button className="mt-6 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer">
                      Run Auth Scan
                    </button>
                  </div>
                )}

                {/* Step 2 Visual */}
                {activeWorkflowStep === 1 && (
                  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="relative h-24 w-24 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 animate-pulse mb-6 flex items-center justify-center">
                      <div className="h-full w-full bg-neutral-950 rounded-full flex items-center justify-center font-bold text-white text-3xl">
                        🧠
                      </div>
                      {/* Floating dots */}
                      <span className="absolute top-0 right-0 h-4 w-4 bg-cyan-400 rounded-full animate-ping" />
                      <span className="absolute bottom-1 left-2 h-3 w-3 bg-purple-400 rounded-full animate-bounce" />
                    </div>
                    <h4 className="text-lg font-bold text-white text-center">AI Agent Pipeline Scanning</h4>
                    <p className="text-xs text-zinc-500 mt-2 max-w-sm text-center">
                      Our LLMs analyze semantics, parse scheduling intent, filter out promotional newsletters, and summarize chat history in isolated sandboxes.
                    </p>
                  </div>
                )}

                {/* Step 3 Visual */}
                {activeWorkflowStep === 2 && (
                  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-full max-w-md p-4 rounded-xl bg-neutral-900 border border-zinc-800 shadow-lg">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-indigo-400" />
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dashboard Preview</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">Ready</span>
                      </div>
                      
                      <div className="space-y-2.5">
                        <div className="p-3 bg-neutral-950 rounded border border-zinc-900/60 flex items-center justify-between">
                          <span className="text-xs text-zinc-200">🚀 Task Checklist Compiled</span>
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded">Actionable</span>
                        </div>
                        <div className="p-3 bg-neutral-950 rounded border border-zinc-900/60 flex items-center justify-between">
                          <span className="text-xs text-zinc-200">📅 Calendar invites updated</span>
                          <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900 px-1.5 py-0.5 rounded">Synced</span>
                        </div>
                        <div className="p-3 bg-neutral-950 rounded border border-zinc-900/60 flex items-center justify-between">
                          <span className="text-xs text-zinc-200">✉️ High-context email drafts created</span>
                          <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-900 px-1.5 py-0.5 rounded">In review</span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-white mt-6">All Done! Focus on what matters</h4>
                    <p className="text-xs text-zinc-500 mt-2 text-center max-w-sm">
                      Check your daily dashboard or receive a morning summary directly on Telegram or WhatsApp. Focus on the core tasks while the agents do the busywork.
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
