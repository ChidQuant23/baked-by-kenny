import { NextRequest, NextResponse } from "next/server";
import { saveProducts } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!Array.isArray(body)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await saveProducts(body);
  return NextResponse.json({ ok: true });
}
