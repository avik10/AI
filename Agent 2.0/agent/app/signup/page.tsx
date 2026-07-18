"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { ArrowLeft, Flash, Google } from "iconoir-react";

type AuthMethod = "email" | "phone";

export default function SignupPage() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");

  // Email form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailStep, setEmailStep] = useState<1 | 2>(1);
  const [emailOtp, setEmailOtp] = useState("");
  
  // Phone form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneChannel, setPhoneChannel] = useState<"sms" | "whatsapp">("whatsapp");
  const [phoneName, setPhoneName] = useState("");
  const [phoneStep, setPhoneStep] = useState<1 | 2>(1);
  const [phoneOtp, setPhoneOtp] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  
  const router = useRouter();
  const { user, checkUserSync } = useAuth();

  // If user is already logged in, redirect them to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Email registration
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoadingState(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name,
        redirectTo: window.location.origin + "/login",
      });

      if (error) {
        setErrorMsg(error.message || "Sign up failed. Please try again.");
      } else if (data) {
        if (data.requireEmailVerification) {
          setEmailStep(2);
          setSuccessMsg("We've sent a 6-digit verification code to your email.");
        } else if (data.accessToken) {
          if (data.user) {
            await checkUserSync(data.user);
          }
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setLoadingState(false);
    }
  };

  // Email verification (OTP code)
  const handleEmailVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp) return;

    setLoadingState(true);
    setErrorMsg("");

    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email,
        otp: emailOtp,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid code.");
      } else if (data) {
        setSuccessMsg("Email verified! Redirecting...");
        if (data.user) {
          await checkUserSync(data.user);
        }
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Verification failed.");
    } finally {
      setLoadingState(false);
    }
  };

  // Google OAuth
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

  // Phone: Send OTP
  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !phoneName) {
      setErrorMsg("Please enter both your name and phone number.");
      return;
    }

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
        throw new Error(result.error || "Failed to send OTP.");
      }

      setSuccessMsg(result.message || "OTP code sent.");
      setPhoneStep(2);
    } catch (err: any) {
      setErrorMsg(err?.message || "Error sending code.");
    } finally {
      setLoadingState(false);
    }
  };

  // Phone: Verify OTP
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
        throw new Error(result.error || "OTP verification failed.");
      }

      setSuccessMsg("Account registered successfully! Accessing workspace...");
      
      // Save session
      if (typeof window !== "undefined") {
        localStorage.setItem("omnisync_phone_session", JSON.stringify(result.user));
      }
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid verification code.");
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] flex items-center justify-center px-4 radial-grid selection:bg-indigo-500/30 selection:text-white">
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />

      {/* Decorative backdrop glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

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
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Create Account</h2>
            <p className="mt-1 text-sm text-zinc-400">Deploy your custom personal AI assistant</p>
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

          {/* Social Sign-In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loadingState}
            className="w-full flex items-center justify-center gap-3 bg-neutral-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-850 font-semibold px-4 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Google className="w-5 h-5 shrink-0" />
            <span>Sign up with Google</span>
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

          {/* Method tabs */}
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

          {/* Email signup steps */}
          {authMethod === "email" && (
            emailStep === 1 ? (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loadingState}
                    className="w-full glassmorphism-input px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-500 font-sans"
                  />
                </div>

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
                  <label htmlFor="password" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Register Account</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailVerify} className="space-y-6">
                <div>
                  <label htmlFor="emailOtp" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 text-center">
                    Enter Verification Code
                  </label>
                  <input
                    id="emailOtp"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                    disabled={loadingState}
                    className="w-full glassmorphism-input px-4 py-4 rounded-xl text-xl font-bold tracking-widest text-center text-white placeholder-zinc-600 font-sans"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingState || emailOtp.length !== 6}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
                >
                  Verify Email
                </button>
              </form>
            )
          )}

          {/* Phone signup steps */}
          {authMethod === "phone" && (
            phoneStep === 1 ? (
              <form onSubmit={handlePhoneSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="phoneName" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    id="phoneName"
                    type="text"
                    required
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
                  disabled={loadingState || !phoneNumber || !phoneName}
                  className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-650 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingState ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register with Phone</span>
                  )}
                </button>
              </form>
            ) : (
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
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
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
                    <span>Confirm and Sign Up</span>
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
                  ← Edit Details
                </button>
              </form>
            )
          )}

          {/* Login Link */}
          <div className="mt-8 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
