import Stripe from "stripe";
import { BUSINESS_NAME } from "./constants";

let cached: Stripe | null = null;
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  cached = new Stripe(key);
  return cached;
}

export const toPence = (pounds: number) => Math.round(pounds * 100);

// Checkout for a bespoke order that Kenny has already quoted.
export async function createOrderCheckout(opts: {
  origin: string;
  token: string;
  description: string;
  amountPence: number;
  customerEmail?: string | null;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: opts.amountPence,
          product_data: { name: `${BUSINESS_NAME} — ${opts.description}` },
        },
      },
    ],
    customer_email: opts.customerEmail || undefined,
    success_url: `${opts.origin}/order/${opts.token}?paid=1`,
    cancel_url: `${opts.origin}/order/${opts.token}`,
    metadata: { type: "order", token: opts.token },
  });
}

// Checkout for a standard fixed-price item bought instantly.
export async function createProductCheckout(opts: {
  origin: string;
  productId: string;
  productName: string;
  amountPence: number;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: opts.amountPence,
          product_data: { name: `${BUSINESS_NAME} — ${opts.productName}` },
        },
      },
    ],
    phone_number_collection: { enabled: true },
    custom_fields: [
      {
        key: "fullname",
        label: { type: "custom", custom: "Your name" },
        type: "text",
      },
      {
        key: "collection",
        label: { type: "custom", custom: "Collection date (DD/MM/YYYY)" },
        type: "text",
      },
      {
        key: "notes",
        label: { type: "custom", custom: "Anything we should know? (optional)" },
        type: "text",
        optional: true,
      },
    ],
    success_url: `${opts.origin}/thank-you`,
    cancel_url: `${opts.origin}/#shop`,
    metadata: { type: "product", productId: opts.productId, productName: opts.productName },
  });
}
