import { ReactNode } from "react";
import Link from "next/link";
import { ParticleBackground } from "@/components/particle-background";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0D08] text-[#DBCAC0] relative flex flex-col justify-center items-center overflow-hidden font-sans">
      <ParticleBackground />
      
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6F8055]/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#DBCAC0]/10 rounded-full blur-[120px] pointer-events-none" />
      
      <nav className="w-full absolute top-0 z-50 py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#6F8055] flex items-center justify-center font-bold text-[#0A0D08] text-sm">
              in
            </div>
            <span className="font-bold text-lg tracking-widest text-[#DBCAC0] uppercase">ContentMint</span>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-md px-6">
        {children}
      </main>
    </div>
  );
}
