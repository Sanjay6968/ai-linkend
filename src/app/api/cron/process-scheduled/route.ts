import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  return handleProcess();
}

export async function POST(req: Request) {
  return handleProcess();
}

async function handleProcess() {
  try {
    const now = new Date();
    const currentDateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentHours = String(now.getHours()).padStart(2, "0");
    const currentMinutes = String(now.getMinutes()).padStart(2, "0");
    const currentTimeStr = `${currentHours}:${currentMinutes}`; // HH:MM

    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: "SCHEDULED",
      },
      include: {
        user: true,
      },
    });

    const duePosts = scheduledPosts.filter((post) => {
      if (!post.scheduledDate) return false;
      const postDateStr = post.scheduledDate.toISOString().split("T")[0];

      if (postDateStr < currentDateStr) return true;

      if (postDateStr === currentDateStr) {
        if (!post.scheduledTime) return true;
        return post.scheduledTime <= currentTimeStr;
      }

      return false;
    });

    if (duePosts.length === 0) {
      return NextResponse.json({
        message: "No scheduled posts are currently due.",
        processed: 0,
      });
    }

    const results = [];

    for (const post of duePosts) {
      const user = post.user;

      if (!user || !user.linkedinConnected || !user.linkedinAccessToken || !user.linkedinPersonUrn) {
        results.push({
          id: post.id,
          title: post.title,
          status: "FAILED",
          error: "User LinkedIn account is not connected",
        });
        continue;
      }

      try {
        const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.linkedinAccessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            author: user.linkedinPersonUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: {
                  text: post.content,
                },
                shareMediaCategory: "NONE",
              },
            },
            visibility: {
              "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Failed to publish scheduled post ${post.id}:`, data);
          results.push({
            id: post.id,
            title: post.title,
            status: "FAILED",
            error: data.message || `LinkedIn error ${response.status}`,
          });
          continue;
        }

        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: "PUBLISHED",
          },
        });

        results.push({
          id: post.id,
          title: post.title,
          status: "PUBLISHED",
          linkedinPostId: data.id,
        });
      } catch (postErr: any) {
        console.error(`Exception publishing scheduled post ${post.id}:`, postErr);
        results.push({
          id: post.id,
          title: post.title,
          status: "ERROR",
          error: postErr.message,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} due posts.`,
      results,
    });
  } catch (error: any) {
    console.error("Error processing scheduled posts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
