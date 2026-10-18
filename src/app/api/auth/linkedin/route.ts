import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const firebaseUid = searchParams.get("firebaseUid");

  if (!firebaseUid) {
    return NextResponse.json({ error: "firebaseUid is required to link LinkedIn account" }, { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:3000/api/auth/linkedin/callback";

  if (!clientId || clientId === "YOUR_LINKEDIN_CLIENT_ID") {
    return NextResponse.json(
      {
        error: "LinkedIn Client ID is not configured yet.",
        setupGuide: "Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to .env.local",
      },
      { status: 500 }
    );
  }

  const scope = encodeURIComponent("openid profile w_member_social email");
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${firebaseUid}&scope=${scope}`;

  return NextResponse.redirect(authUrl);
}
