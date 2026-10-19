"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Calendar as CalendarIcon, Clock, Save, Copy, LayoutDashboard, Loader2, Check, Volume2, VolumeX, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/firebase/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [postStyle, setPostStyle] = useState("framework");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPublishingLinkedIn, setIsPublishingLinkedIn] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleVoiceOver = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech audio is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!generatedContent) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(generatedContent);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleAutoSetPeakTime = () => {
    const today = new Date();
    const currentDay = today.getDay();
    let daysToAdd = 1;
    if (currentDay === 4) daysToAdd = 5;
    else if (currentDay === 5) daysToAdd = 4;
    else if (currentDay === 6) daysToAdd = 3;
    else if (currentDay === 0) daysToAdd = 2;
    else daysToAdd = 1;

    const targetDate = new Date();
    targetDate.setDate(today.getDate() + daysToAdd);
    const dateStr = targetDate.toISOString().split("T")[0];
    
    setScheduledDate(dateStr);
    setScheduledTime("08:30");
    showFeedback("Auto-set to peak LinkedIn reach slot: 08:30 AM!");
  };

  const calculateReachMetrics = (text: string | null) => {
    if (!text) return { score: 70, label: "Moderate", readingTime: "1 min read" };
    const words = text.trim().split(/\s+/).length;
    const lines = text.split("\n").filter(l => l.trim().length > 0).length;
    let score = 65;
    if (words >= 100 && words <= 350) score += 15;
    if (lines >= 5) score += 10;
    if (text.includes("?") || text.includes("agree") || text.includes("thoughts")) score += 10;
    score = Math.min(score, 98);
    const label = score >= 85 ? "High Viral Potential" : score >= 75 ? "Strong Reach" : "Standard Reach";
    const readingTime = `${Math.max(1, Math.ceil(words / 200))} min read`;
    return { score, label, readingTime };
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    
    const apiKey = localStorage.getItem("groq_api_key");

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, apiKey, style: postStyle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content");
      }

      setGeneratedContent(data.content);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    const contentToSave = generatedContent || prompt;
    if (!contentToSave) {
      alert("Please enter a prompt or generate content first.");
      return;
    }

    if (!user) {
      alert("You must be logged in to save drafts.");
      return;
    }

    setIsSavingDraft(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          content: contentToSave,
          status: "DRAFT",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");

      showFeedback("Draft saved successfully to database!");
    } catch (err: any) {
      alert(err.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSchedulePost = async () => {
    const contentToSave = generatedContent || prompt;
    if (!contentToSave) {
      alert("Please generate content before scheduling.");
      return;
    }

    if (!scheduledDate) {
      alert("Please pick a date in Publish Settings before scheduling.");
      return;
    }

    if (!user) {
      alert("You must be logged in to schedule posts.");
      return;
    }

    setIsScheduling(true);
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          content: contentToSave,
          status: "SCHEDULED",
          scheduledDate,
          scheduledTime,
          userTimezone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule post");

      showFeedback(`Post scheduled for ${scheduledDate} at ${scheduledTime}!`);
    } catch (err: any) {
      alert(err.message || "Failed to schedule post");
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePublishLinkedIn = async () => {
    if (!generatedContent) return;
    if (!user) {
      alert("Please log in first.");
      return;
    }

    setIsPublishingLinkedIn(true);
    try {
      const res = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          content: generatedContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 || data.error?.includes("429") || data.error?.includes("share limit")) {
          navigator.clipboard.writeText(generatedContent);
          alert(
            "LinkedIn Daily API Limit Reached (LinkedIn limits new developer apps to 1-2 automated posts/day).\n\n" +
            "✅ Your post has been automatically copied to your clipboard!\n" +
            "Opening LinkedIn now so you can hit Ctrl + V to post."
          );
          window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank");
          showFeedback("Copied to clipboard! Ready to paste on LinkedIn.");
          return;
        }
        throw new Error(data.error || "Failed to publish");
      }

      showFeedback("Published directly to your LinkedIn feed!");
    } catch (err: any) {
      alert(err.message || "Failed to publish to LinkedIn. Please connect your account in Settings.");
    } finally {
      setIsPublishingLinkedIn(false);
    }
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#DBCAC0]">Workspace</h1>
          <p className="text-[#DBCAC0]/60 mt-1">Generate and schedule your LinkedIn content.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {feedbackMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#6F8055]/20 text-[#6F8055] border border-[#6F8055]/30 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> {feedbackMessage}
            </motion.div>
          )}

          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={isSavingDraft || (!generatedContent && !prompt)}
            className="border-[#DBCAC0]/20 text-[#DBCAC0] hover:bg-[#3E4F32]/20 disabled:opacity-50"
          >
            {isSavingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Draft
          </Button>

          <Button 
            onClick={handleSchedulePost}
            disabled={isScheduling || !generatedContent}
            className="bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] font-bold transition-colors disabled:opacity-50"
          >
            {isScheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarIcon className="mr-2 h-4 w-4" />}
            Schedule Post
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="glass-panel bg-[#0A0D08]/60 border-[#DBCAC0]/10 flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl text-[#DBCAC0] flex items-center gap-2">
                <Sparkles className="text-[#DBCAC0] h-5 w-5" /> AI Composer
              </CardTitle>
              <CardDescription className="text-[#DBCAC0]/50">
                Describe the topic, tone, and structure of your desired post.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <Textarea 
                placeholder="e.g. Write a contrarian post about why software engineers shouldn't learn every new framework. Keep the tone professional but punchy. Include actionable insights."
                className="flex-1 resize-none bg-[#3E4F32]/10 border-[#DBCAC0]/20 text-[#DBCAC0] placeholder:text-[#DBCAC0]/30 focus-visible:ring-[#6F8055] min-h-[160px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="space-y-2">
                <label className="text-xs text-[#DBCAC0]/50 font-medium uppercase tracking-wider">Post Style</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "story", label: "Story" },
                    { key: "contrarian", label: "Hot Take" },
                    { key: "framework", label: "Framework" },
                    { key: "case_study", label: "Case Study" },
                    { key: "observation", label: "Insight" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPostStyle(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        postStyle === key
                          ? "bg-[#6F8055] border-[#6F8055] text-[#0A0D08]"
                          : "bg-transparent border-[#DBCAC0]/20 text-[#DBCAC0]/60 hover:border-[#6F8055]/50 hover:text-[#DBCAC0]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={!prompt || isGenerating}
                className="w-full bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] font-bold h-12 disabled:opacity-50"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> Generating Content...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-5 w-5" /> Generate Content
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-panel bg-[#0A0D08]/60 border-[#DBCAC0]/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-[#DBCAC0]">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#DBCAC0]/60 font-medium uppercase tracking-wider">Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#DBCAC0]/40" />
                    <Input 
                      type="date" 
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="pl-9 bg-[#3E4F32]/10 border-[#DBCAC0]/20 text-[#DBCAC0] focus-visible:ring-[#6F8055] [&::-webkit-calendar-picker-indicator]:invert" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#DBCAC0]/60 font-medium uppercase tracking-wider">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-[#DBCAC0]/40" />
                    <Input 
                      type="time" 
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="pl-9 bg-[#3E4F32]/10 border-[#DBCAC0]/20 text-[#DBCAC0] focus-visible:ring-[#6F8055] [&::-webkit-calendar-picker-indicator]:invert" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DBCAC0]/10 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[#DBCAC0] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#6F8055]" /> Peak Reach Window
                  </p>
                  <p className="text-[10px] text-[#DBCAC0]/50">Tue / Thu · 8:00 AM - 10:00 AM</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAutoSetPeakTime}
                  className="border-[#6F8055]/40 text-[#6F8055] hover:bg-[#3E4F32]/30 text-xs h-7 font-bold"
                >
                  <Zap className="w-3 h-3 mr-1" /> Auto-Set Peak Slot
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 flex flex-col">
          <Card className="glass-panel bg-[#3E4F32]/10 border-[#DBCAC0]/10 flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-[#DBCAC0]/10 bg-[#0A0D08]/40 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#DBCAC0]">Live Preview</CardTitle>
              {generatedContent && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleVoiceOver}
                    className={`h-8 text-xs font-semibold ${isPlayingAudio ? "text-green-400 bg-green-500/10" : "text-[#DBCAC0]/70 hover:text-[#DBCAC0] hover:bg-[#3E4F32]/30"}`}
                  >
                    {isPlayingAudio ? (
                      <><VolumeX className="h-4 w-4 mr-1.5 text-green-400 animate-pulse" /> Stop Voice</>
                    ) : (
                      <><Volume2 className="h-4 w-4 mr-1.5 text-[#6F8055]" /> Voice Over</>
                    )}
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopy}
                    className="text-[#DBCAC0]/60 hover:text-[#DBCAC0] hover:bg-[#3E4F32]/30 h-8 text-xs"
                  >
                    {copied ? (
                      <><Check className="h-4 w-4 mr-1.5 text-green-400" /> Copied!</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-1.5" /> Copy</>
                    )}
                  </Button>

                  <Button 
                    size="sm" 
                    onClick={handlePublishLinkedIn}
                    disabled={isPublishingLinkedIn}
                    className="bg-[#0A66C2] hover:bg-[#004182] text-white font-bold h-8 text-xs flex items-center gap-1.5 shadow"
                  >
                    {isPublishingLinkedIn ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className="font-black text-xs">in</span>
                    )}
                    Post to LinkedIn
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto">
              {isGenerating ? (
                <div className="h-full w-full flex flex-col items-center justify-center space-y-4 text-[#DBCAC0]">
                  <Sparkles className="h-10 w-10 animate-pulse text-[#6F8055]" />
                  <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Crafting high-impact post via ContentMint AI...</p>
                </div>
              ) : generatedContent ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8"
                >
                  {(() => {
                    const metrics = calculateReachMetrics(generatedContent);
                    return (
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-6 rounded-xl bg-[#0A0D08]/80 border border-[#6F8055]/30">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#6F8055]/20 flex items-center justify-center text-[#6F8055]">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#DBCAC0]">Viral Reach Potential:</span>
                              <span className="text-xs font-extrabold text-[#6F8055]">{metrics.score}/100</span>
                              <span className="text-[10px] bg-[#6F8055]/20 text-[#6F8055] px-2 py-0.5 rounded-full font-bold">{metrics.label}</span>
                            </div>
                            <p className="text-[11px] text-[#DBCAC0]/60">Pacing: {metrics.readingTime} · Best Time: Tue / Thu at 08:30 AM</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={handleAutoSetPeakTime}
                          className="text-[#6F8055] hover:text-[#DBCAC0] hover:bg-[#3E4F32]/30 text-xs h-7 font-bold"
                        >
                          <Zap className="w-3 h-3 mr-1 text-[#6F8055]" /> Apply Peak Slot
                        </Button>
                      </div>
                    );
                  })()}

                  <Tabs defaultValue="post" className="w-full">
                    <TabsList className="bg-[#0A0D08]/80 border border-[#DBCAC0]/10 mb-6">
                      <TabsTrigger value="post" className="data-[state=active]:bg-[#6F8055] data-[state=active]:text-[#0A0D08] font-bold">Text Post</TabsTrigger>
                      <TabsTrigger value="carousel" className="data-[state=active]:bg-[#6F8055] data-[state=active]:text-[#0A0D08] font-bold">Carousel Draft</TabsTrigger>
                    </TabsList>
                    <TabsContent value="post" className="mt-0 outline-none">
                      <div className="bg-[#0A0D08] rounded-xl border border-[#DBCAC0]/20 p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6F8055] to-[#DBCAC0] flex items-center justify-center font-bold text-[#0A0D08]">
                            {user?.email ? user.email[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-[#DBCAC0]">{user?.displayName || user?.email?.split('@')[0] || "Your Profile"}</div>
                            <div className="text-xs text-[#DBCAC0]/50">{user?.email || "Software Engineer"}</div>
                            <div className="text-xs text-[#DBCAC0]/40 flex items-center gap-1 mt-0.5">
                              Just now • Public
                            </div>
                          </div>
                        </div>
                        <Textarea 
                          className="w-full min-h-[300px] bg-transparent border-none p-0 text-[#DBCAC0] leading-relaxed resize-none focus-visible:ring-0 text-[15px]"
                          value={generatedContent}
                          onChange={(e) => setGeneratedContent(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="carousel">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { title: "Hook & Problem", desc: generatedContent.split("\n\n")[0] || "Opening hook for your carousel slides." },
                          { title: "Key Insights", desc: generatedContent.split("\n\n")[1] || "Core takeaway and actionable steps." },
                          { title: "Action / CTA", desc: generatedContent.split("\n\n")[2] || "Final slide question and engagement ask." },
                        ].map((slide, idx) => (
                          <div key={idx} className="aspect-[4/5] bg-[#0A0D08] rounded-xl border border-[#DBCAC0]/20 p-6 flex flex-col justify-center items-center text-center shadow-lg group hover:border-[#6F8055] transition-colors cursor-pointer relative overflow-hidden">
                            <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#3E4F32] flex items-center justify-center text-xs font-bold text-[#DBCAC0]">{idx + 1}</div>
                            <h3 className="text-base font-bold text-[#DBCAC0] mb-2">{slide.title}</h3>
                            <p className="text-[#DBCAC0]/60 text-xs line-clamp-4 leading-relaxed">{slide.desc}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-[#DBCAC0]/20">
                  <LayoutDashboard className="h-16 w-16 mb-4 opacity-50" />
                  <p className="font-medium text-lg">Your generated content will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
