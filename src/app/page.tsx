"use client";

import { motion, useScroll } from "framer-motion";
import { Database, Calendar, Bot, LayoutDashboard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ParticleBackground } from "@/components/particle-background";

import { Variants } from "framer-motion";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

function FeatureCard({ icon, title, description, accentColor }: { icon: React.ReactNode, title: string, description: string, accentColor: string }) {
  return (
    <div className="glass-panel p-8 rounded-xl flex flex-col items-start border border-[#DBCAC0]/10 hover:border-[#6F8055]/50 transition-colors h-full bg-[#0A0D08]/60">
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 border"
        style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30`, color: accentColor }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-[#DBCAC0]">{title}</h3>
      <p className="text-sm text-[#DBCAC0]/70 leading-relaxed">{description}</p>
    </div>
  );
}

function InteractiveMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-16">
      <div className="glass-panel bg-[#0A0D08]/90 rounded-xl overflow-hidden border border-[#DBCAC0]/15 shadow-xl">
        <div className="bg-[#3E4F32]/30 border-b border-[#DBCAC0]/10 px-4 py-3 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#DBCAC0]/30" />
            <div className="w-3 h-3 rounded-full bg-[#DBCAC0]/30" />
            <div className="w-3 h-3 rounded-full bg-[#6F8055]/50" />
          </div>
          <div className="text-xs text-[#DBCAC0]/70 font-semibold tracking-wider uppercase">ContentMint Workspace Preview</div>
          <div className="w-12" />
        </div>

        <div className="p-6 md:p-8 min-h-[260px]">
          <div className="flex flex-col gap-5">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3E4F32]/50 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#DBCAC0]">You</span>
              </div>
              <div className="bg-[#3E4F32]/20 border border-[#DBCAC0]/10 rounded-lg p-3.5 text-sm text-[#DBCAC0] max-w-xl">
                Write an actionable LinkedIn post about why engineers should ship fast instead of over-architecting.
              </div>
            </div>

            {step >= 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[#6F8055]/20 flex items-center justify-center shrink-0 text-[#6F8055]">
                  <Bot size={18} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="bg-[#0A0D08] p-4 rounded-lg border border-[#DBCAC0]/15 border-l-2 border-l-[#6F8055]">
                    <p className="text-[#DBCAC0] font-medium text-sm leading-relaxed">
                      Stop losing 6 months building the perfect architecture for zero users.
                    </p>
                    <p className="text-[#DBCAC0]/70 text-xs mt-2 leading-relaxed">
                      The fastest way to learn what to build is to ship a focused prototype, measure customer response, and iterate.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 bg-[#6F8055] text-[#0A0D08] rounded-md text-xs font-bold">Post to LinkedIn</span>
                    <span className="px-3 py-1.5 bg-[#3E4F32]/30 border border-[#DBCAC0]/20 text-[#DBCAC0] rounded-md text-xs font-medium">Schedule</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <main className="min-h-screen bg-[#0A0D08] text-[#DBCAC0] relative overflow-hidden font-sans">
      <ParticleBackground />
      
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6F8055]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#DBCAC0]/5 rounded-full blur-[120px] pointer-events-none" />

      <nav 
        className={`w-full fixed top-0 z-50 transition-all duration-200 border-b ${
          isScrolled ? "bg-[#0A0D08]/95 backdrop-blur-md border-[#DBCAC0]/10 py-3.5" : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6F8055] flex items-center justify-center font-bold text-[#0A0D08] text-sm">
              in
            </div>
            <span className="font-bold text-lg tracking-wider text-[#DBCAC0] uppercase">ContentMint</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[#DBCAC0]/80 hover:text-[#DBCAC0] transition-colors text-sm font-semibold px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-lg bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] text-sm font-bold transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E4F32]/30 border border-[#6F8055]/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#6F8055]" />
            <span className="text-xs font-semibold text-[#DBCAC0] uppercase tracking-wider">Groq LPU · LinkedIn OAuth · Prisma ORM</span>
          </motion.div>
          
          <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15] text-[#DBCAC0]">
            Turn a Rough Idea into a<br />
            Published LinkedIn Post
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-lg text-[#DBCAC0]/70 mb-10 max-w-2xl leading-relaxed font-normal">
            Describe your topic. Pick a format — story, framework, hot take, or case study. Get a ready-to-post draft in under two seconds, then schedule or publish directly to your profile.
          </motion.p>
          
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/dashboard" className="px-6 py-3 rounded-lg bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] font-bold flex items-center justify-center gap-2 transition-colors">
              <LayoutDashboard size={18} />
              Open Workspace
            </Link>
            <Link href="/register" className="px-6 py-3 rounded-lg border border-[#DBCAC0]/20 hover:bg-[#3E4F32]/20 text-[#DBCAC0] font-semibold flex items-center justify-center transition-colors">
              Create Free Account
            </Link>
          </motion.div>
        </motion.div>
        
        <InteractiveMockup />
      </section>

      <section id="features" className="py-24 px-6 max-w-6xl mx-auto relative z-10 border-t border-[#DBCAC0]/10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold mb-3 text-[#DBCAC0]">Purpose-Built Architecture</h2>
          <p className="text-[#DBCAC0]/70 max-w-xl mx-auto text-base">Engineered for speed, data persistence, and direct social distribution.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Bot size={24} />}
            title="Groq LPU Inference"
            description="High-speed model execution constructs professional LinkedIn hooks and structured insights in under two seconds."
            accentColor="#6F8055"
          />
          <FeatureCard 
            icon={<Database size={24} />}
            title="Type-Safe Relational Persistence"
            description="Prisma schema keeps your drafts, scheduled calendar, and user profiles secure and permanently saved."
            accentColor="#DBCAC0"
          />
          <FeatureCard 
            icon={<Calendar size={24} />}
            title="Automated Publishing"
            description="Direct LinkedIn OAuth 2.0 integration publishes scheduled content directly to your personal profile feed."
            accentColor="#6F8055"
          />
        </div>

        <div className="glass-panel rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden bg-[#3E4F32]/20 border border-[#6F8055]/30 mt-12">
          <div className="relative z-10 max-w-lg mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-2 text-[#DBCAC0]">Ready to streamline your content?</h3>
            <p className="text-[#DBCAC0]/70 text-sm">Join founders and engineers building their audience with structured, data-driven LinkedIn posts.</p>
          </div>
          <Link href="/register" className="relative z-10 px-6 py-3 rounded-lg bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] font-bold transition-colors flex items-center gap-2 text-sm">
            Get Started Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#DBCAC0]/10 py-10 px-6 text-center text-[#DBCAC0]/50 text-xs">
        <p>© {new Date().getFullYear()} ContentMint. All rights reserved.</p>
      </footer>
    </main>
  );
}
