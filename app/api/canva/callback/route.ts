import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCanvaCode } from "@/lib/canva";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const verifier = cookies().get("canva_verifier")?.value;
  if (!code || !verifier) {
    return NextResponse.redirect("/dashboard/settings/integrations?error=1");
  }
  try {
    const tokenData = await exchangeCanvaCode(code, verifier);
    const res = NextResponse.redirect(
      "/dashboard/settings/integrations?canva=connected",
    );
    res.cookies.set("canva_token", tokenData.access_token, {
      httpOnly: true,
      path: "/",
    });
    res.cookies.delete("canva_verifier", { path: "/" });
    return res;
  } catch {
    return NextResponse.redirect("/dashboard/settings/integrations?error=1");
  }
}
