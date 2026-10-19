import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get("firebaseUid");
    const status = searchParams.get("status");
    const dateStr = searchParams.get("date");

    if (!firebaseUid) {
      return NextResponse.json({ error: "firebaseUid is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      return NextResponse.json({ posts: [] });
    }

    const whereClause: any = { userId: user.id };
    if (status) {
      whereClause.status = status;
    }

    if (dateStr) {
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
      whereClause.scheduledDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firebaseUid, email, title, content, status = "DRAFT", scheduledDate, scheduledTime, userTimezone } = body;

    if (!firebaseUid) {
      return NextResponse.json({ error: "firebaseUid is required" }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: { email: email || "" },
      create: {
        firebaseUid,
        email: email || "",
      },
    });

    const cleanTitle = title || content.split("\n")[0].substring(0, 60) + (content.length > 60 ? "..." : "");

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        title: cleanTitle,
        content,
        status,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime: scheduledTime || null,
        userTimezone: userTimezone || null,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("Failed to save post:", error);
    return NextResponse.json({ error: error.message || "Failed to save post" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const firebaseUid = searchParams.get("firebaseUid");

    if (!id || !firebaseUid) {
      return NextResponse.json({ error: "Post id and firebaseUid are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.post.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete post:", error);
    return NextResponse.json({ error: error.message || "Failed to delete post" }, { status: 500 });
  }
}
