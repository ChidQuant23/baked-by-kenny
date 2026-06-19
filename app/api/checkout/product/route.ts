import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/db";
import { createProductCheckout, toPence } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    const product = (await getProducts()).find((p) => p.id === productId && p.active);
    if (!product) return NextResponse.json({ error: "Item not available" }, { status: 404 });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const session = await createProductCheckout({
      origin, productId: product.id, productName: product.name,
      amountPence: toPence(product.price),
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
