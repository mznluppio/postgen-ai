// app/api/canva/callback/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCanvaCode } from "@/lib/canva";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const cookieJar = await cookies();
  const verifier = cookieJar.get("canva_verifier")?.value;

  const errorUrl = new URL(
    "/dashboard/settings/integrations",
    req.nextUrl.origin,
  );
  errorUrl.searchParams.set("error", "1");
  if (!code || !verifier) return NextResponse.redirect(errorUrl);

  try {
    const tokenData = await exchangeCanvaCode(code, verifier);

    const successUrl = new URL(
      "/dashboard/settings/integrations",
      req.nextUrl.origin,
    );
    successUrl.searchParams.set("canva", "connected");

    const res = NextResponse.redirect(successUrl);
    res.cookies.set("canva_token", tokenData.access_token, {
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.cookies.delete("canva_verifier", { domain: "127.0.0.1", path: "/" });
    return res;
  } catch (err) {
    console.error("Canva exchange error:", err);
    return NextResponse.redirect(errorUrl);
  }
}
