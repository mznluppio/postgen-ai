import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateCanvaAuth } from "@/lib/canva";

export async function GET() {
  const { url, verifier } = generateCanvaAuth();
  const res = NextResponse.redirect(url);
  const cookieStore = await cookies();
  cookieStore.set("canva_verifier", verifier, {
    httpOnly: true,
    path: "/",
  });
  return res;
}
