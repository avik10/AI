import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Agent - Personal AI Assistant & Workspace",
  description: "Connect Gmail, WhatsApp, Telegram, and Outlook to generate intelligent summaries and reminders.",
  verification: {
    google: "9Mj7Wbvy6fCZynlQmgKvXfUM1zUvYMllFPZx8Uwa03E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="9Mj7Wbvy6fCZynlQmgKvXfUM1zUvYMllFPZx8Uwa03E" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
