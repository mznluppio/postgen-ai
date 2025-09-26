import { NextResponse } from "next/server";
import { processScheduledContent } from "@/lib/automation-processor";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await processScheduledContent();
  const status = result.errors.length > 0 && result.processed === 0 ? 500 : 200;
  return NextResponse.json(result, { status });
}

export async function GET() {
  return POST();
}
