// app/api/canva/auth/route.ts
import { NextResponse } from "next/server";
import { generateCanvaAuth } from "@/lib/canva";

export async function GET() {
  const { url, verifier } = generateCanvaAuth();
  const res = NextResponse.redirect(url);

  // On force le domaine 127.0.0.1 et les bonnes options en DEV
  res.cookies.set("canva_verifier", verifier, {
    domain: "127.0.0.1",
    path: "/",
    httpOnly: true,
    secure: false, // false en dev
    sameSite: "lax", // "lax" en dev pour conserver le cookie en cross-site
    maxAge: 60 * 10, // 10 minutes
  });

  return res;
}
