import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="max-w-3xl w-full bg-neutral-900/60 border border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
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
            <h2 className="text-lg font-bold text-white mb-2">1. Overview</h2>
            <p>
              OmniSync.ai ("we", "our", or "us") provides a full-stack personal AI agent workspace. This Privacy Policy details how we handle user information when you connect integrations such as Gmail, WhatsApp via Sent.dm, and other platforms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Information We Access</h2>
            <p>
              When you grant permissions to OmniSync via Google OAuth, we access only the specific scopes you authorize (e.g. <code className="text-indigo-400 bg-neutral-950 px-1.5 py-0.5 rounded">gmail.readonly</code>). We use this data solely to display unread inbox summaries, extract calendar items, and execute natural language agent commands authorized by you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Google User Data Policy Compliance</h2>
            <p>
              OmniSync’s use and transfer of information received from Google APIs to any other app will adhere to Google’s <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Data Storage and Security</h2>
            <p>
              OAuth access tokens and user settings are stored securely in PostgreSQL databases provided by InsForge BaaS with encrypted access control. We do not sell or share user email data with third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Contact & Data Deletion</h2>
            <p>
              You can disconnect integrations at any time from the Integrations tab on your dashboard, which immediately revokes stored access tokens. For questions, contact <span className="text-indigo-400 font-mono">avik.bhattacharjya28@gmail.com</span>.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
          <span>Effective Date: July 18, 2026</span>
          <span>OmniSync.ai Compliant Privacy Notice</span>
        </div>
      </div>
    </div>
  );
}
