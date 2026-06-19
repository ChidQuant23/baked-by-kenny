import { NextRequest, NextResponse } from "next/server";
import { createEnquiry } from "@/lib/db";
import { notifyOwner } from "@/lib/notify";

function id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b?.name?.trim() || !b?.phone?.trim()) {
      return NextResponse.json({ error: "Missing name or phone" }, { status: 400 });
    }
    const enquiry = await createEnquiry({
      id: id(),
      name: String(b.name).trim().slice(0, 120),
      email: b.email ? String(b.email).trim().slice(0, 160) : null,
      phone: b.phone ? String(b.phone).trim().slice(0, 40) : null,
      sizeId: String(b.sizeId ?? ""),
      sizeName: String(b.sizeName ?? ""),
      flavourId: String(b.flavourId ?? ""),
      flavourName: String(b.flavourName ?? ""),
      estimate: Number(b.estimate) || 0,
      dateNeeded: b.dateNeeded || null,
      collectionDate: b.collectionDate || null,
      details: b.details ? String(b.details).slice(0, 2000) : null,
      status: "New",
    });
    await notifyOwner(enquiry);
    return NextResponse.json({ ok: true, token: enquiry.token });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not save enquiry" }, { status: 500 });
  }
}
