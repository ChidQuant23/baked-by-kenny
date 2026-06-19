import { NextRequest, NextResponse } from "next/server";
import { savePricing } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!body?.sizes || !body?.flavours) {
    return NextResponse.json({ error: "Invalid pricing" }, { status: 400 });
  }
  await savePricing(body);
  return NextResponse.json({ ok: true });
}
