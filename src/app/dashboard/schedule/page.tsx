"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Send, Loader2, Plus, Trash2, CheckCircle2, Play, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/AuthContext";

interface ScheduledItem {
  id: string;
  title: string;
  content: string;
  status: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  createdAt: string;
}

export default function SchedulePage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SCHEDULED" | "PUBLISHED">("ALL");
  const [playingPostId, setPlayingPostId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayAudio = (id: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio voice over is not supported in this browser.");
      return;
    }
    if (playingPostId === id) {
      window.speechSynthesis.cancel();
      setPlayingPostId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setPlayingPostId(null);
    utterance.onerror = () => setPlayingPostId(null);
    setPlayingPostId(id);
    window.speechSynthesis.speak(utterance);
  };

  const fetchScheduled = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/posts?firebaseUid=${user.uid}`);
      const data = await res.json();
      if (res.ok && data.posts) {
        const scheduled = data.posts.filter((p: any) => p.status === "SCHEDULED" || p.status === "PUBLISHED");
        setScheduledPosts(scheduled);
      }
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkLinkedInStatus = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user/status?firebaseUid=${user.uid}`);
      const data = await res.json();
      if (res.ok && data.connected) {
        setLinkedinConnected(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runSchedulerNow = async () => {
    setIsProcessing(true);
    setProcessMessage(null);
    try {
      const res = await fetch("/api/cron/process-scheduled");
      const data = await res.json();
      if (res.ok) {
        setProcessMessage(data.message || "Scheduler ran successfully.");
        await fetchScheduled();
      } else {
        setProcessMessage(data.error || "Failed to run scheduler.");
      }
    } catch (e: any) {
      setProcessMessage(e.message || "Error running scheduler.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessMessage(null), 5000);
    }
  };

  useEffect(() => {
    if (user) {
      checkLinkedInStatus();
      fetchScheduled();
      fetch("/api/cron/process-scheduled")
        .then(() => fetchScheduled())
        .catch(() => {});
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to cancel this scheduled post?")) return;

    try {
      const res = await fetch(`/api/posts?id=${id}&firebaseUid=${user.uid}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handlePostDirectlyNow = async (post: ScheduledItem) => {
    if (!user) return;
    try {
      const res = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          content: post.content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 || data.error?.includes("429") || data.error?.includes("share limit")) {
          navigator.clipboard.writeText(post.content);
          alert(
            "LinkedIn Daily API Limit Reached (Unverified accounts are limited to 1-2 automated posts/day).\n\n" +
            "✅ Post copied to clipboard! Opening LinkedIn compose now..."
          );
          window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank");
          return;
        }
        alert(data.error || "Failed to publish to LinkedIn");
        return;
      }

      alert("Published successfully to LinkedIn!");
      await fetchScheduled();
    } catch (err: any) {
      alert(err.message || "Failed to publish to LinkedIn");
    }
  };

  const selectedDateStr = date ? date.toISOString().split("T")[0] : null;
  const filteredPosts = scheduledPosts.filter((post) => {
    if (statusFilter !== "ALL" && post.status !== statusFilter) return false;
    if (!selectedDateStr || !post.scheduledDate) return true;
    return post.scheduledDate.startsWith(selectedDateStr);
  });

  const queuedCount = scheduledPosts.filter((p) => p.status === "SCHEDULED").length;
  const publishedCount = scheduledPosts.filter((p) => p.status === "PUBLISHED").length;

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#DBCAC0]">Schedule</h1>
          <p className="text-[#DBCAC0]/60 mt-1">Manage and automate your upcoming LinkedIn pipeline.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={runSchedulerNow}
            disabled={isProcessing}
            className="border-[#6F8055]/40 text-[#DBCAC0] hover:bg-[#3E4F32]/20 text-xs font-bold"
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 mr-1.5 text-[#6F8055]" />
            )}
            Run Auto-Publisher
          </Button>

          <Link 
            href="/dashboard" 
            className={cn(buttonVariants({ variant: "default" }), "bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] font-bold text-xs")}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Schedule New
          </Link>
        </div>
      </div>

      {processMessage && (
        <div className="p-3 bg-[#3E4F32]/30 border border-[#6F8055]/40 rounded-xl text-xs text-[#DBCAC0] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#6F8055]" />
          {processMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-panel bg-[#0A0D08]/60 border-[#DBCAC0]/10">
            <CardHeader className="pb-4 border-b border-[#DBCAC0]/10">
              <CardTitle className="text-sm font-bold text-[#DBCAC0]">Content Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-0 bg-transparent text-[#DBCAC0]"
                classNames={{
                  selected: "bg-[#6F8055] text-[#0A0D08] hover:bg-[#6F8055] hover:text-[#0A0D08] focus:bg-[#6F8055] focus:text-[#0A0D08]",
                  today: "bg-[#3E4F32]/50 text-[#DBCAC0]",
                }}
              />
            </CardContent>
          </Card>

          <Card className="glass-panel bg-[#3E4F32]/10 border-[#6F8055]/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[#DBCAC0]">Automated Publishing</h3>
                {linkedinConnected ? (
                  <span className="bg-[#6F8055]/20 text-[#6F8055] text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-[#6F8055]/30">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded">
                    Not Linked
                  </span>
                )}
              </div>
              <p className="text-xs text-[#DBCAC0]/70 mb-4 leading-relaxed">
                {linkedinConnected
                  ? "Your LinkedIn profile is linked. Due scheduled posts are automatically published."
                  : "Connect your LinkedIn profile via OAuth to automatically publish scheduled posts."}
              </p>
              {!linkedinConnected && (
                <Button 
                  onClick={() => {
                    if (!user) {
                      alert("Please log in first.");
                      return;
                    }
                    window.location.href = `/api/auth/linkedin?firebaseUid=${user.uid}`;
                  }}
                  className="w-full bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] font-bold text-xs"
                >
                  Connect LinkedIn
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg font-bold text-[#DBCAC0] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#6F8055]" />
              {date ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "All Dates"}
            </h2>

            <div className="flex items-center gap-1 bg-[#0A0D08]/60 border border-[#DBCAC0]/10 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === "ALL"
                    ? "bg-[#6F8055] text-[#0A0D08]"
                    : "text-[#DBCAC0]/60 hover:text-[#DBCAC0]"
                }`}
              >
                All ({scheduledPosts.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("SCHEDULED")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === "SCHEDULED"
                    ? "bg-[#6F8055] text-[#0A0D08]"
                    : "text-[#DBCAC0]/60 hover:text-[#DBCAC0]"
                }`}
              >
                Queued ({queuedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("PUBLISHED")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === "PUBLISHED"
                    ? "bg-[#6F8055] text-[#0A0D08]"
                    : "text-[#DBCAC0]/60 hover:text-[#DBCAC0]"
                }`}
              >
                Published ({publishedCount})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16 text-[#DBCAC0]">
              <Loader2 className="w-8 h-8 animate-spin text-[#6F8055] mr-3" />
              <p className="font-medium">Loading schedule...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 border border-dashed border-[#DBCAC0]/10 rounded-2xl flex flex-col items-center justify-center text-center">
              <Clock className="w-12 h-12 text-[#DBCAC0]/30 mb-3" />
              <p className="font-bold text-base text-[#DBCAC0] mb-1">No posts found</p>
              <p className="text-xs text-[#DBCAC0]/60 max-w-xs mb-5">
                {statusFilter !== "ALL"
                  ? `No ${statusFilter.toLowerCase()} posts found for this date filter.`
                  : "Pick a date in the Workspace and click Schedule Post to queue your next update."}
              </p>
              <Link 
                href="/dashboard"
                className={cn(buttonVariants({ variant: "outline" }), "border-[#6F8055]/40 text-[#DBCAC0] hover:bg-[#3E4F32]/20 text-xs font-bold")}
              >
                + Schedule Post
              </Link>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#6F8055] before:to-transparent">
              {filteredPosts.map((post) => {
                const isPublished = post.status === "PUBLISHED";
                return (
                  <div key={post.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0A0D08] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2",
                      isPublished ? "bg-green-600 text-white" : "bg-[#6F8055] text-white"
                    )}>
                      {isPublished ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Send className="w-4 h-4 text-[#0A0D08]" />}
                    </div>
                    <Card className="glass-panel w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0A0D08]/60 border-[#DBCAC0]/10 hover:border-[#6F8055]/50 transition-colors">
                      <CardHeader className="py-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[#DBCAC0] text-xs font-bold uppercase tracking-wider">
                            {post.scheduledTime || "09:00"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1",
                              isPublished ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-[#6F8055]/20 text-[#6F8055] border border-[#6F8055]/30"
                            )}>
                              {isPublished ? "● Published Live" : "● Queued"}
                            </span>
                            <button 
                              onClick={() => handleDelete(post.id)}
                              className="text-[#DBCAC0]/40 hover:text-red-400 transition-colors p-1"
                              title="Delete post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <CardTitle className="text-base text-[#DBCAC0] leading-snug font-bold line-clamp-1">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-sm text-[#DBCAC0]/60 line-clamp-2 leading-relaxed mb-3">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-[#DBCAC0]/10">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePlayAudio(post.id, post.content)}
                            className={`text-xs h-7 font-semibold ${playingPostId === post.id ? "text-green-400 bg-green-500/10" : "text-[#DBCAC0]/60 hover:text-[#DBCAC0] hover:bg-[#3E4F32]/30"}`}
                          >
                            {playingPostId === post.id ? (
                              <><VolumeX className="w-3 h-3 mr-1 text-green-400 animate-pulse" /> Stop Voice</>
                            ) : (
                              <><Volume2 className="w-3 h-3 mr-1 text-[#6F8055]" /> Voice Over</>
                            )}
                          </Button>

                          {!isPublished && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePostDirectlyNow(post)}
                              className="text-xs text-[#6F8055] hover:text-[#DBCAC0] hover:bg-[#3E4F32]/30 h-7 font-bold"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" /> Post Now
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0A0D08] bg-[#3E4F32] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                <Link
                  href="/dashboard"
                  className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 border border-dashed border-[#DBCAC0]/20 rounded-xl text-center text-[#DBCAC0]/60 text-sm hover:border-[#6F8055]/50 hover:bg-[#3E4F32]/10 transition-colors block font-medium"
                >
                  + Schedule another post
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
