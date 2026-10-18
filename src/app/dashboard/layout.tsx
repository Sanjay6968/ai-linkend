"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PenTool, Calendar, Settings, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const navItems = [
    { name: "Workspace", href: "/dashboard", icon: LayoutDashboard },
    { name: "Drafts", href: "/dashboard/drafts", icon: PenTool },
    { name: "Schedule", href: "/dashboard/schedule", icon: Calendar },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0D08] text-[#DBCAC0]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#6F8055]" />
          <p className="font-medium animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0D08] text-[#DBCAC0] overflow-hidden font-sans selection:bg-[#6F8055]/30">
      <aside className="w-64 border-r border-[#DBCAC0]/10 bg-[#0A0D08]/50 backdrop-blur-xl flex flex-col justify-between hidden md:flex z-20">
        <div>
          <div className="p-6">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-[#6F8055] flex items-center justify-center font-bold text-[#0A0D08] text-sm">
                in
              </div>
              <span className="font-bold text-lg tracking-widest text-[#DBCAC0] uppercase">ContentMint</span>
            </Link>
          </div>
          
          <nav className="mt-6 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-[#6F8055]/20 text-[#DBCAC0] border border-[#6F8055]/30" 
                      : "text-[#DBCAC0]/60 hover:bg-[#3E4F32]/20 hover:text-[#DBCAC0]"
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-[#6F8055]" : "text-[#DBCAC0]/40"} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 mb-4">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-[#DBCAC0]/60 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative z-10 pb-16 md:pb-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#6F8055]/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="p-6 md:p-8 max-w-6xl mx-auto h-full">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0D08]/95 backdrop-blur-xl border-t border-[#DBCAC0]/10 flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                isActive ? "text-[#6F8055]" : "text-[#DBCAC0]/50 hover:text-[#DBCAC0]"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
