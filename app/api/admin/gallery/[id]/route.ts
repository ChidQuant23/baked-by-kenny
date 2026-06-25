import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { deletePhoto } from "@/lib/db";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = await deletePhoto(id);
  if (url) {
    try { await del(url); } catch (e) { console.error("Blob delete failed:", e); }
  }
  return NextResponse.json({ ok: true });
}