import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Playground from "@/components/Playground";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#030303] text-[#f5f5f7] font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Features Narrative List */}
        <Features />

        {/* Interactive Playgrounds */}
        <Playground />
      </main>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

