import { prisma } from "@/lib/prisma";

export async function processDueScheduledPosts() {
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

    if (duePosts.length === 0) return;

    console.log(`[Auto-Scheduler] Found ${duePosts.length} due post(s). Processing...`);

    for (const post of duePosts) {
      const user = post.user;

      if (!user || !user.linkedinConnected || !user.linkedinAccessToken || !user.linkedinPersonUrn) {
        console.warn(`[Auto-Scheduler] Skipping post ${post.id}: User not connected to LinkedIn.`);
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

        if (response.ok) {
          await prisma.post.update({
            where: { id: post.id },
            data: { status: "PUBLISHED" },
          });
          console.log(`[Auto-Scheduler] ✅ Successfully published post: "${post.title}" (ID: ${data.id})`);
        } else {
          console.warn(`[Auto-Scheduler] ⚠️ LinkedIn blocked post ${post.id}:`, data.message || response.status);
        }
      } catch (err: any) {
        console.error(`[Auto-Scheduler] Error posting ${post.id}:`, err.message);
      }
    }
  } catch (error: any) {
    console.error("[Auto-Scheduler Exception]:", error.message);
  }
}
