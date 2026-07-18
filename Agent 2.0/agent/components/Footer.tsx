"use client";

import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="border-t border-zinc-900 bg-neutral-950/80 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16">
          
          {/* Logo & Tagline */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-neutral-950">
                  <svg
                    className="h-4.5 w-4.5 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
              <span className="font-sans font-bold text-lg tracking-tight text-white">
                OmniSync<span className="text-indigo-400">.ai</span>
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Deploy autonomous AI agents that securely connect your communication channels to auto-synthesize summaries, tasks, and replies.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {/* Twitter */}
              <a href="#" className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="#" className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              {/* Discord */}
              <a href="#" className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Footnotes Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Column 1: Product */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
              <nav className="flex flex-col gap-2.5">
                <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
                <a href="#playground" className="text-sm text-zinc-400 hover:text-white transition-colors">Playground</a>
                <a href="#integrations" className="text-sm text-zinc-400 hover:text-white transition-colors">Integrations</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
              </nav>
            </div>

            {/* Column 2: Resources */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
              <nav className="flex flex-col gap-2.5">
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Documentation</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Guides</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">API Status</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Security</a>
              </nav>
            </div>

            {/* Column 3: Company */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
              <nav className="flex flex-col gap-2.5">
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">About Us</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Blog</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Careers</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Press Kit</a>
              </nav>
            </div>

            {/* Column 4: Newsletter */}
            <div className="flex flex-col gap-4 min-w-[200px]">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Get Updates</h4>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <p className="text-xs text-zinc-400 mb-1 leading-relaxed">
                  Join our weekly newsletter for the latest agentic updates.
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glassmorphism-input px-3.5 py-2 rounded-xl text-xs text-white placeholder-zinc-500 font-sans"
                  />
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    {subscribed ? "Subscribed! ✓" : "Subscribe"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-900 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} OmniSync AI, Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
