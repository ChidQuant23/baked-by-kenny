import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { markPaidBySession, createPaidStandardOrder, getEnquiryByToken } from "@/lib/db";
import { notifyPaymentReceived } from "@/lib/notify";

export const runtime = "nodejs";

function field(session: Stripe.Checkout.Session, key: string): string | null {
  const f = session.custom_fields?.find((x) => x.key === key);
  return f?.text?.value ?? null;
}

// Convert "DD/MM/YYYY" to an ISO date, or null if it doesn't parse.
function ukDateToIso(s: string | null): string | null {
  if (!s) return null;
  const m = s.match(/(\d{1,2})\D(\d{1,2})\D(\d{2,4})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const yyyy = y.length === 2 ? `20${y}` : y;
  return `${yyyy}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("Webhook signature check failed:", err);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const pi = typeof session.payment_intent === "string" ? session.payment_intent : null;

    try {
      if (session.metadata?.type === "order") {
        const order = await markPaidBySession(session.id, pi);
        if (order) await notifyPaymentReceived(order);
      } else if (session.metadata?.type === "product") {
        const order = await createPaidStandardOrder({
          id: session.id,
          name: field(session, "fullname") || session.customer_details?.name || "Customer",
          email: session.customer_details?.email ?? null,
          phone: session.customer_details?.phone ?? null,
          itemName: session.metadata.productName || "Standard item",
          amount: Math.round((session.amount_total ?? 0) / 100),
          collectionDate: ukDateToIso(field(session, "collection")),
          details: field(session, "notes"),
          stripeSessionId: session.id,
          stripePaymentIntent: pi,
        });
        await notifyPaymentReceived(order);
      }
    } catch (err) {
      console.error("Webhook handling error:", err);
      // Return 200 anyway so Stripe doesn't hammer retries on a logic bug;
      // the payment itself is safe in Stripe and visible in its dashboard.
    }
  }

  return NextResponse.json({ received: true });
}
