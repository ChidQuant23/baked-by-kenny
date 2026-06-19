import { NextRequest, NextResponse } from "next/server";
import { updateStatus, deleteEnquiry, setQuote, getEnquiry } from "@/lib/db";
import { STATUSES, type Status } from "@/lib/constants";
import { sendQuoteReadyEmail } from "@/lib/email";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();

  if (typeof body.status === "string") {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await updateStatus(id, body.status as Status);
  }

  if (body.quote !== undefined) {
    const q = Number(body.quote);
    if (!Number.isFinite(q) || q < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    await setQuote(id, Math.round(q));
    // Email the customer their pay link if requested and we have an address.
    if (body.notify) {
      const order = await getEnquiry(id);
      if (order?.email) {
        const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
        await sendQuoteReadyEmail(order, `${origin}/order/${order.token}`);
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await deleteEnquiry(id);
  return NextResponse.json({ ok: true });
}
