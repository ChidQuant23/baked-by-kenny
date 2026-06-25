import { NextRequest, NextResponse } from "next/server";
import { addPhoto, listPhotos } from "@/lib/db";

function id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function GET() {
  return NextResponse.json(await listPhotos());
}

export async function POST(req: NextRequest) {
  const { url, caption } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing image url" }, { status: 400 });
  }
  const photo = await addPhoto(id(), url, caption ? String(caption).slice(0, 200) : null);
  return NextResponse.json(photo);
}