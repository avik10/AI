import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="max-w-3xl w-full bg-neutral-900/60 border border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
            <p className="text-xs text-zinc-400 mt-1">OmniSync AI Personal Agent & Workspace Platform</p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-bold px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"
          >
            ← Return to Dashboard
          </Link>
        </div>

        <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Terms Acceptance</h2>
            <p>
              By accessing or using OmniSync.ai, you agree to be bound by these Terms of Service. If you do not agree, please do not connect your third-party accounts or use our personal agent services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Use of Agent Services</h2>
            <p>
              OmniSync provides automated AI agent tools designed to assist you with inbox summaries, WhatsApp messaging, and task digests. You are responsible for maintaining the security of your connected account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. API Usage & Third-Party Platforms</h2>
            <p>
              Integration features rely on third-party services including Google Cloud APIs and Sent.dm messaging APIs. Use of these integrations must comply with the respective third-party terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Termination</h2>
            <p>
              You may stop using OmniSync and disconnect all connected platform accounts at any time from your dashboard settings.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
          <span>Effective Date: July 18, 2026</span>
          <span>OmniSync.ai Terms of Service</span>
        </div>
      </div>
    </div>
  );
}
