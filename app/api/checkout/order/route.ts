import { NextRequest, NextResponse } from "next/server";
import { getEnquiryByToken, attachSession } from "@/lib/db";
import { createOrderCheckout, toPence } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    const order = token ? await getEnquiryByToken(String(token)) : null;
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.paymentStatus === "paid")
      return NextResponse.json({ error: "Already paid" }, { status: 409 });
    if (order.quote == null)
      return NextResponse.json({ error: "No price set yet" }, { status: 400 });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const desc = [order.sizeName, order.flavourName].filter(Boolean).join(" · ") || "Custom cake";
    const session = await createOrderCheckout({
      origin, token: order.token, description: desc,
      amountPence: toPence(order.quote), customerEmail: order.email,
    });
    await attachSession(order.id, session.id);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
