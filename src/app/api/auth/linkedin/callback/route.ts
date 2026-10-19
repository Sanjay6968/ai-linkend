import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // firebaseUid passed in state
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const origin = isLocal ? `http://${host}` : (process.env.NEXT_PUBLIC_APP_URL || "https://ai-linkend-two.vercel.app");

  if (error) {
    console.error("LinkedIn OAuth Error:", error, errorDescription);
    return NextResponse.redirect(`${origin}/dashboard/settings?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/dashboard/settings?error=Invalid_OAuth_Parameters`);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/linkedin/callback`;

  try {
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("LinkedIn Token Exchange Failed:", tokenData);
      const detail = tokenData.error_description || tokenData.error || "Token_Exchange_Failed";
      return NextResponse.redirect(`${origin}/dashboard/settings?error=${encodeURIComponent(detail)}`);
    }

    const accessToken = tokenData.access_token;

    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profileData = await profileRes.json();
    const personUrn = profileData.sub ? `urn:li:person:${profileData.sub}` : null;

    await prisma.user.upsert({
      where: { firebaseUid: state },
      update: {
        linkedinAccessToken: accessToken,
        linkedinPersonUrn: personUrn,
        linkedinConnected: true,
      },
      create: {
        firebaseUid: state,
        email: profileData.email || "",
        linkedinAccessToken: accessToken,
        linkedinPersonUrn: personUrn,
        linkedinConnected: true,
      },
    });

    return NextResponse.redirect(`${origin}/dashboard/settings?linkedin=success`);
  } catch (err: any) {
    console.error("LinkedIn Callback Exception:", err);
    return NextResponse.redirect(`${origin}/dashboard/settings?error=Internal_OAuth_Error`);
  }
}
