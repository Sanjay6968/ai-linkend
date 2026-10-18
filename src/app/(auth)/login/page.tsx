"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-panel bg-[#0A0D08]/80 border-[#DBCAC0]/20 shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-extrabold text-[#DBCAC0]">Welcome back</CardTitle>
          <CardDescription className="text-[#DBCAC0]/60">
            Sign in to continue to your ContentMint workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <Label htmlFor="email" className="text-[#DBCAC0]/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-[#DBCAC0]/40" />
                  <Input 
                    id="email" 
                    placeholder="name@example.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-[#3E4F32]/10 border-[#DBCAC0]/20 text-[#DBCAC0] placeholder:text-[#DBCAC0]/30 focus:border-[#6F8055] focus:ring-[#6F8055]"
                  />
                </div>
              </div>
              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#DBCAC0]/80">Password</Label>
                  <Link href="/forgot-password" className="text-sm font-medium text-[#DBCAC0] hover:text-[#DBCAC0] transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-[#DBCAC0]/40" />
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-[#3E4F32]/10 border-[#DBCAC0]/20 text-[#DBCAC0] placeholder:text-[#DBCAC0]/30 focus:border-[#6F8055] focus:ring-[#6F8055]"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm font-medium p-3 bg-red-400/10 rounded-lg border border-red-400/20">
                {error}
              </div>
            )}
            
            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#6F8055] hover:bg-[#3E4F32] transition-colors text-[#DBCAC0] font-bold h-11 flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-[#DBCAC0]/60 w-full">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#6F8055] font-bold hover:text-[#DBCAC0] transition-colors">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
