"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, MoreVertical, Trash2, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/AuthContext";

interface PostItem {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function DraftsPage() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/posts?firebaseUid=${user.uid}&status=DRAFT`);
      const data = await res.json();
      if (res.ok && data.posts) {
        setDrafts(data.posts);
      }
    } catch (err) {
      console.error("Failed to load drafts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDrafts();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this draft?")) return;

    try {
      const res = await fetch(`/api/posts?id=${id}&firebaseUid=${user.uid}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete draft:", err);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-[#DBCAC0]">Drafts</h1>
          <p className="text-[#DBCAC0]/60 mt-1">Manage your saved and generated content ideas.</p>
        </div>
        <Link 
          href="/dashboard" 
          className={cn(buttonVariants({ variant: "default" }), "bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] font-bold")}
        >
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-[#DBCAC0]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6F8055] mr-3" />
          <p className="font-medium">Loading saved drafts...</p>
        </div>
      ) : drafts.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#3E4F32]/20 flex items-center justify-center mb-4 text-[#DBCAC0]/40">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#DBCAC0] mb-2">No drafts saved yet</h3>
          <p className="text-[#DBCAC0]/60 max-w-sm mb-6">
            Head to the Workspace, generate a LinkedIn post with AI, and click "Save Draft".
          </p>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "default" }), "bg-[#6F8055] hover:bg-[#3E4F32] text-[#DBCAC0] font-bold")}
          >
            Go to Workspace
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft) => (
            <Card key={draft.id} className="glass-panel bg-[#0A0D08]/60 border-[#DBCAC0]/10 flex flex-col hover:border-[#6F8055]/50 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="space-y-1 pr-2">
                  <CardTitle className="text-base text-[#DBCAC0] leading-snug font-bold line-clamp-2">{draft.title}</CardTitle>
                  <CardDescription className="text-[#6F8055] text-[11px] font-bold uppercase tracking-wider">{draft.status}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-[#DBCAC0]/60 hover:text-[#DBCAC0] hover:bg-[#3E4F32]/30 -mr-2 -mt-2")}>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#0A0D08]/90 backdrop-blur-xl border-[#DBCAC0]/10 text-[#DBCAC0]">
                    <DropdownMenuItem 
                      onClick={() => handleDelete(draft.id)}
                      className="text-red-400 hover:bg-red-500/10 cursor-pointer focus:bg-red-500/10 focus:text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-[#DBCAC0]/70 line-clamp-4 mb-6 leading-relaxed">
                  {draft.content}
                </p>
                <div className="flex items-center text-xs text-[#DBCAC0]/40 font-medium">
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Saved on {new Date(draft.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </CardContent>
            </Card>
          ))}

          <Link
            href="/dashboard"
            className="glass-panel bg-transparent border-[#DBCAC0]/10 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[220px] hover:bg-[#3E4F32]/10 hover:border-[#6F8055]/50 transition-colors cursor-pointer group p-6"
          >
            <div className="w-12 h-12 rounded-full bg-[#3E4F32]/30 flex items-center justify-center mb-4 group-hover:bg-[#6F8055]/30 transition-colors">
              <Plus className="h-5 w-5 text-[#DBCAC0]/60 group-hover:text-[#DBCAC0] transition-colors" />
            </div>
            <p className="font-bold text-[#DBCAC0]/80 group-hover:text-[#DBCAC0] transition-colors">Create New Draft</p>
          </Link>
        </div>
      )}
    </div>
  );
}
