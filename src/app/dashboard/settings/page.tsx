"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, CreditCard, User, Shield, CheckCircle2, Save, Share2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/firebase/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const linkedinSuccess = searchParams.get("linkedin") === "success";
  const oauthError = searchParams.get("error");

  useEffect(() => {
    const savedKey = localStorage.getItem("groq_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }

    const checkLinkedIn = async () => {
      if (!user) return;
      try {
        setCheckingStatus(true);
        const res = await fetch(`/api/user/status?firebaseUid=${user.uid}`);
        const data = await res.json();
        if (res.ok && data.connected) {
          setLinkedinConnected(true);
        }
      } catch (e) {
        console.error("Failed to check LinkedIn status:", e);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkLinkedIn();
  }, [user]);

  const handleSaveApiKey = () => {
    localStorage.setItem("groq_api_key", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleConnectLinkedIn = () => {
    if (!user) {
      alert("Please log in first.");
      return;
    }
    window.location.href = `/api/auth/linkedin?firebaseUid=${user.uid}`;
  };

  return (
    <div className="flex flex-col h-full space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-[#DBCAC0]">Settings</h1>
        <p className="text-[#DBCAC0]/60 mt-1">Manage your account, API configurations, and billing.</p>
      </div>

      {linkedinSuccess && (
        <div className="p-4 rounded-xl bg-[#6F8055]/20 border border-[#6F8055]/40 text-[#6F8055] flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">Your LinkedIn account has been connected successfully!</p>
        </div>
      )}

      {oauthError && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <p className="text-sm">LinkedIn connection failed: {oauthError}</p>
        </div>
      )}

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="bg-[#0A0D08]/80 border border-[#DBCAC0]/10 mb-8 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#6F8055] data-[state=active]:text-[#0A0D08] font-bold px-6 py-2">
            <User className="w-4 h-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-[#6F8055] data-[state=active]:text-[#0A0D08] font-bold px-6 py-2">
            <Key className="w-4 h-4 mr-2" /> Integrations & APIs
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-[#6F8055] data-[state=active]:text-[#0A0D08] font-bold px-6 py-2">
            <CreditCard className="w-4 h-4 mr-2" /> Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="glass-panel bg-[#0A0D08]/60 border-[#DBCAC0]/10">
            <CardHeader>
              <CardTitle className="text-xl text-[#DBCAC0]">Personal Information</CardTitle>
              <CardDescription className="text-[#DBCAC0]/60">Update your name and email address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#DBCAC0]/80">Full Name</Label>
                <Input id="name" defaultValue={user?.displayName || user?.email?.split("@")[0] || ""} placeholder="Your full name" className="bg-[#3E4F32]/10 border-[#DBCAC0]/20 text-[#DBCAC0] focus-visible:ring-[#6F8055]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#DBCAC0]/80">Email Address</Label>
                <Input id="email" defaultValue={user?.email || ""} disabled className="bg-[#3E4F32]/10 border-[#DBCAC0]/20 text-[#DBCAC0]/60 opacity-70" />
              </div>
            </CardContent>
            <CardFooter className="border-t border-[#DBCAC0]/10 pt-6">
              <Button className="bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] font-bold">Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card className="glass-panel bg-[#0A0D08]/60 border-[#DBCAC0]/10">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-[#DBCAC0] flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-[#6F8055]" /> LinkedIn Account Integration
                  </CardTitle>
                  <CardDescription className="text-[#DBCAC0]/60 mt-1">
                    Connect your LinkedIn profile to publish AI-generated posts directly to your feed with one click.
                  </CardDescription>
                </div>
                {linkedinConnected && (
                  <span className="bg-[#6F8055]/20 text-[#6F8055] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#6F8055]/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {linkedinConnected ? (
                <div className="p-4 rounded-xl bg-[#3E4F32]/20 border border-[#6F8055]/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#6F8055] flex items-center justify-center font-bold text-[#0A0D08]">
                      in
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#DBCAC0]">LinkedIn Account Linked</p>
                      <p className="text-xs text-[#DBCAC0]/60">Authorized for direct publishing (w_member_social)</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      alert("To disconnect, revoke ContentMint's access in your LinkedIn Settings > Data Privacy > Permitted Services.");
                    }}
                    className="border-[#DBCAC0]/20 text-[#DBCAC0]/70 hover:bg-[#3E4F32]/30 text-xs"
                  >
                    Manage
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-[#DBCAC0]/70">
                    Authorize ContentMint using official LinkedIn OAuth 2.0 to post directly without manual copy-pasting.
                  </p>
                  <Button 
                    onClick={handleConnectLinkedIn}
                    className="bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] font-bold"
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Connect LinkedIn Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel bg-[#0A0D08]/60 border-[#DBCAC0]/10">
            <CardHeader>
              <CardTitle className="text-xl text-[#DBCAC0] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#DBCAC0]" /> Groq API Configuration
              </CardTitle>
              <CardDescription className="text-[#DBCAC0]/60">
                Custom API key override. If left empty, your application automatically uses the system environment key.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groq-key" className="text-[#DBCAC0]/80">Groq Secret Key</Label>
                <Input 
                  id="groq-key" 
                  type="password" 
                  placeholder="gsk_..." 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-[#3E4F32]/10 border-[#DBCAC0]/20 text-[#DBCAC0] focus-visible:ring-[#6F8055] font-mono" 
                />
                <p className="text-xs text-[#DBCAC0]/50 mt-2">
                  You can get a free API key from the <a href="https://console.groq.com/" target="_blank" rel="noreferrer" className="text-[#6F8055] hover:underline font-bold">Groq Console</a>.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-[#DBCAC0]/10 pt-6 flex gap-4">
              <Button 
                onClick={handleSaveApiKey}
                disabled={!apiKey}
                className="bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] font-bold transition-colors disabled:opacity-50"
              >
                {saved ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved!</> : <><Save className="w-4 h-4 mr-2" /> Save API Key</>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="glass-panel bg-[#0A0D08]/60 border-[#DBCAC0]/10 border-l-4 border-l-[#DBCAC0]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-[#DBCAC0]">Pro Subscription</CardTitle>
                  <CardDescription className="text-[#DBCAC0]/60 mt-2">
                    You are currently on the Pro plan.
                  </CardDescription>
                </div>
                <div className="bg-[#DBCAC0]/20 text-[#DBCAC0] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Active
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold text-[#DBCAC0]">$15</span>
                <span className="text-[#DBCAC0]/60 mb-1">/ month</span>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-[#DBCAC0]">
                  <CheckCircle2 className="w-4 h-4 text-[#6F8055]" /> Unlimited AI Generations
                </li>
                <li className="flex items-center gap-3 text-sm text-[#DBCAC0]">
                  <CheckCircle2 className="w-4 h-4 text-[#6F8055]" /> Smart Scheduling
                </li>
                <li className="flex items-center gap-3 text-sm text-[#DBCAC0]">
                  <CheckCircle2 className="w-4 h-4 text-[#6F8055]" /> Priority Groq LPU Inference
                </li>
              </ul>
            </CardContent>
            <CardFooter className="border-t border-[#DBCAC0]/10 pt-6 flex gap-4">
              <Button className="bg-[#3E4F32] hover:bg-[#6F8055] text-[#DBCAC0] font-bold">Manage Billing</Button>
              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400">Cancel Plan</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
