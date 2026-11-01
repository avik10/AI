"use client";

import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { Linkedin } from "iconoir-react";

export default function LinkedInButton() {
  const { connectLinkedIn, linkedinLoading } = useAuth();

  const handleClick = async () => {
    try {
      await connectLinkedIn();
    } catch (e) {
      console.error("LinkedIn connect error", e);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={linkedinLoading}
      className="w-full flex items-center justify-center gap-3 bg-[#0067B5] border border-[#005582] text-white hover:bg-[#005582] font-semibold px-4 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
    >
      <Linkedin className="w-5 h-5 shrink-0" />
      <span>Continue with LinkedIn</span>
    </button>
  );
}
