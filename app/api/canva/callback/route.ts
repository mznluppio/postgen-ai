import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCanvaCode } from "@/lib/canva";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const cookieStore = await cookies();
  const verifier = cookieStore.get("canva_verifier")?.value;

  const errorUrl = new URL(
    "/dashboard/settings/integrations",
    req.nextUrl.origin,
  );
  errorUrl.searchParams.set("error", "1");

  if (!code || !verifier) {
    return NextResponse.redirect(errorUrl);
  }

  try {
    const tokenData = await exchangeCanvaCode(code, verifier);
    const successUrl = new URL(
      "/dashboard/settings/integrations",
      req.nextUrl.origin,
    );
    successUrl.searchParams.set("canva", "connected");
    const res = NextResponse.redirect(successUrl);
    res.cookies.set("canva_token", tokenData.access_token, {
      httpOnly: true,
      path: "/",
    });
    res.cookies.delete("canva_verifier", { path: "/" });
    return res;
  } catch {
    return NextResponse.redirect(errorUrl);
  }
}
