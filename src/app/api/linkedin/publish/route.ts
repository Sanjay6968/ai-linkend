import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { firebaseUid, content } = await req.json();

    if (!firebaseUid) {
      return NextResponse.json({ error: "firebaseUid is required" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user || !user.linkedinAccessToken || !user.linkedinPersonUrn) {
      return NextResponse.json(
        { error: "LinkedIn account is not connected. Please connect LinkedIn in Settings." },
        { status: 400 }
      );
    }

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
              text: content,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LinkedIn publish error response:", errorText);
      return NextResponse.json(
        { error: `LinkedIn API error (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Published directly to LinkedIn successfully!",
      postId: data.id,
    });
  } catch (error: any) {
    console.error("LinkedIn publish exception:", error);
    return NextResponse.json(
      { error: error.message || "Failed to publish to LinkedIn" },
      { status: 500 }
    );
  }
}
