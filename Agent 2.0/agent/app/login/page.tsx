"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { ArrowLeft, Flash, Google } from "iconoir-react";

type AuthMethod = "email" | "phone";

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  
  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Phone form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneChannel, setPhoneChannel] = useState<"sms" | "whatsapp">("whatsapp");
  const [phoneName, setPhoneName] = useState(""); // Optional display name for phone login
  const [phoneStep, setPhoneStep] = useState<1 | 2>(1);
  const [phoneOtp, setPhoneOtp] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // If user is already logged in, redirect them to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoadingState(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to sign in. Please verify your credentials.");
      } else if (data) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setLoadingState(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingState(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await insforge.auth.signInWithOAuth("google", {
        redirectTo: window.location.origin + "/dashboard",
      });

      if (error) {
        setErrorMsg(error.message || "Google OAuth sign in failed.");
        setLoadingState(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Google login error occurred.");
      setLoadingState(false);
    }
  };

  // Phone Authentication: Send OTP
  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setLoadingState(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/auth/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          channel: phoneChannel,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to send code.");
      }

      setSuccessMsg(result.message || "Verification code dispatched successfully.");
      setPhoneStep(2);
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred while sending the OTP.");
    } finally {
      setLoadingState(false);
    }
  };

  // Phone Authentication: Verify OTP
  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtp) return;

    setLoadingState(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          code: phoneOtp,
          name: phoneName,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Verification failed.");
      }

      setSuccessMsg("Phone verified successfully! Accessing workspace...");
      
      // Save session in localStorage for AuthProvider retrieval
      if (typeof window !== "undefined") {
        localStorage.setItem("omnisync_phone_session", JSON.stringify(result.user));
      }
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid or expired OTP code.");
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] flex items-center justify-center px-4 radial-grid selection:bg-indigo-500/30 selection:text-white">
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />

      {/* Decorative backdrop glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Form Container */}
        <div className="glassmorphism-card rounded-2xl p-8 border border-zinc-850 shadow-2xl">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-neutral-950">
                <Flash className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
            <p className="mt-1 text-sm text-zinc-400">Sign in to your OmniSync workspace</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-xs text-red-400 leading-relaxed font-sans">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-400 leading-relaxed font-sans">
              {successMsg}
            </div>
          )}

          {/* Social Sign-In (Always show as top option) */}
          <button
            onClick={handleGoogleLogin}
            disabled={loadingState}
            className="w-full flex items-center justify-center gap-3 bg-neutral-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-850 font-semibold px-4 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Google className="w-5 h-5 shrink-0" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-900" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-neutral-950 px-3 text-zinc-500 font-semibold">Or select method</span>
            </div>
          </div>

          {/* Tab selector for custom auth options */}
          <div className="flex gap-2 p-1 bg-neutral-900 rounded-xl mb-6 border border-zinc-850">
            <button
              onClick={() => {
                setAuthMethod("email");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMethod === "email"
                  ? "bg-zinc-800 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => {
                setAuthMethod("phone");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMethod === "phone"
                  ? "bg-zinc-800 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Phone (Sent.dm OTP)
            </button>
          </div>

          {/* Email Login Flow */}
          {authMethod === "email" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loadingState}
                  className="w-full glassmorphism-input px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-500 font-sans"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot Password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loadingState}
                  className="w-full glassmorphism-input px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-500 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loadingState}
                className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-650 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingState ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* Phone Login Flow */}
          {authMethod === "phone" && (
            phoneStep === 1 ? (
              /* Step 1: Input details and choose channel */
              <form onSubmit={handlePhoneSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="phoneName" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Your Name (Optional)
                  </label>
                  <input
                    id="phoneName"
                    type="text"
                    placeholder="John Doe"
                    value={phoneName}
                    onChange={(e) => setPhoneName(e.target.value)}
                    disabled={loadingState}
                    className="w-full glassmorphism-input px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-500 font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Phone Number (with Country Code)
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    required
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loadingState}
                    className="w-full glassmorphism-input px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
                    Select Verification Channel
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPhoneChannel("whatsapp")}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        phoneChannel === "whatsapp"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-neutral-900 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>WhatsApp OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneChannel("sms")}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        phoneChannel === "sms"
                          ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400"
                          : "bg-neutral-900 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>SMS OTP</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingState || !phoneNumber}
                  className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-655 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingState ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Requesting OTP...</span>
                    </>
                  ) : (
                    <span>Request Verification Code</span>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Input code */
              <form onSubmit={handlePhoneVerifyOtp} className="space-y-6">
                <div>
                  <label htmlFor="phoneOtp" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 text-center">
                    Enter Verification Code
                  </label>
                  <input
                    id="phoneOtp"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                    disabled={loadingState}
                    className="w-full glassmorphism-input px-4 py-4 rounded-xl text-xl font-bold tracking-widest text-center text-white placeholder-zinc-600 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingState || phoneOtp.length !== 6}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-650 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loadingState ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <span>Confirm and Sign In</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep(1);
                    setPhoneOtp("");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="w-full text-center text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  ← Edit Phone Details
                </button>
              </form>
            )
          )}

          {/* Create Account Link */}
          <div className="mt-8 text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign up for free
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
