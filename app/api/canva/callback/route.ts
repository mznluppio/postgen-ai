import { NextRequest, NextResponse } from "next/server";
import { exchangeCanvaCode } from "@/lib/canva";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect("/dashboard/settings/integrations?error=1");
  }
  try {
    const tokenData = await exchangeCanvaCode(code);
    const res = NextResponse.redirect(
      "/dashboard/settings/integrations?canva=connected",
    );
    res.cookies.set("canva_token", tokenData.access_token, {
      httpOnly: true,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.redirect("/dashboard/settings/integrations?error=1");
  }
}
