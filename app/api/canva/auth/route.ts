import { NextResponse } from "next/server";
import { getCanvaAuthUrl } from "@/lib/canva";

export async function GET() {
  const url = getCanvaAuthUrl();
  return NextResponse.redirect(url);
}
