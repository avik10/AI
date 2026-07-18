"use client";

import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="glassmorphism rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-neutral-950">
                <svg
                  className="h-5 w-5 text-indigo-400"
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
            <span className="font-sans font-bold text-xl tracking-tight text-white bg-clip-text bg-gradient-to-r from-white to-zinc-400">
              OmniSync<span className="text-indigo-400">.ai</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#playground"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Playground
            </a>
            <a
              href="#integrations"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Integrations
            </a>
            <a
              href="#workflow"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
            >
              How It Works
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="/login"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 px-4 py-2"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-xl group bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-cyan-400 hover:text-white focus:ring-4 focus:outline-none focus:ring-indigo-800 transition-all duration-300 shadow-md shadow-indigo-500/10 cursor-pointer !mb-0 !me-0"
            >
              <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-neutral-950 rounded-[10px] group-hover:bg-opacity-0">
                Get Started Free
              </span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 mt-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="glassmorphism-card rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-zinc-300 hover:text-white py-2 transition-colors"
            >
              Features
            </a>
            <a
              href="#playground"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-zinc-300 hover:text-white py-2 transition-colors"
            >
              Playground
            </a>
            <a
              href="#integrations"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-zinc-300 hover:text-white py-2 transition-colors"
            >
              Integrations
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-zinc-300 hover:text-white py-2 transition-colors"
            >
              How It Works
            </a>
            <hr className="border-zinc-800" />
            <div className="flex flex-col gap-3">
              <a
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-medium text-zinc-300 hover:text-white py-2 transition-colors"
              >
                Sign In
              </a>
              <a
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 group hover:text-white cursor-pointer"
              >
                <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-neutral-950 rounded-[10px] group-hover:bg-opacity-0">
                  Get Started Free
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
