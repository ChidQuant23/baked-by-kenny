import { NextResponse } from "next/server";
import { markAllSeen } from "@/lib/db";

export async function POST() {
  await markAllSeen();
  return NextResponse.json({ ok: true });
}
