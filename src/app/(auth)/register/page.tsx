"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
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
          <CardTitle className="text-3xl font-extrabold text-[#DBCAC0]">Create an account</CardTitle>
          <CardDescription className="text-[#DBCAC0]/60">
            Start generating premium LinkedIn content in seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <Label htmlFor="name" className="text-[#DBCAC0]/80">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-[#DBCAC0]/40" />
                  <Input 
                    id="name" 
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10 bg-[#3E4F32]/10 border-[#DBCAC0]/20 text-[#DBCAC0] placeholder:text-[#DBCAC0]/30 focus:border-[#6F8055] focus:ring-[#6F8055]"
                  />
                </div>
              </div>
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
                <Label htmlFor="password" className="text-[#DBCAC0]/80">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-[#DBCAC0]/40" />
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 bg-[#3E4F32]/10 border-[#DBCAC0]/20 text-[#DBCAC0] placeholder:text-[#DBCAC0]/30 focus:border-[#6F8055] focus:ring-[#6F8055]"
                  />
                </div>
                <p className="text-xs text-[#DBCAC0]/40 pt-1">Must be at least 6 characters long.</p>
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-[#DBCAC0]/60 w-full">
            Already have an account?{" "}
            <Link href="/login" className="text-[#6F8055] font-bold hover:text-[#DBCAC0] transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
