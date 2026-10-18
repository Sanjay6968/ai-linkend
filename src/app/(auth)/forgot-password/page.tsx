"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
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
          <CardTitle className="text-3xl font-extrabold text-[#DBCAC0]">Reset Password</CardTitle>
          <CardDescription className="text-[#DBCAC0]/60">
            Enter your email and we'll send you a recovery link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-[#6F8055]" />
              <div className="space-y-2">
                <p className="text-[#DBCAC0] font-medium">Check your inbox</p>
                <p className="text-sm text-[#DBCAC0]/60">We sent a password reset link to {email}</p>
              </div>
              <Link 
                href="/login"
                className="mt-4 w-full bg-gradient-to-r from-[#6F8055] to-[#3E4F32] hover:scale-[1.02] transition-transform text-[#DBCAC0] font-bold h-11 flex items-center justify-center rounded-md"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
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
              </div>

              {error && (
                <div className="text-red-400 text-sm font-medium p-3 bg-red-400/10 rounded-lg border border-red-400/20">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit"
                disabled={loading || !email}
                className="w-full bg-[#6F8055] hover:bg-[#3E4F32] transition-colors text-[#DBCAC0] font-bold h-11 flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending link...</>
                ) : (
                  <>Send Recovery Link <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="flex flex-col gap-4">
            <div className="text-sm text-center text-[#DBCAC0]/60 w-full">
              Remember your password?{" "}
              <Link href="/login" className="flex items-center justify-center text-[#6F8055] font-bold hover:text-[#DBCAC0] transition-colors mt-2">
                Back to sign in
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
