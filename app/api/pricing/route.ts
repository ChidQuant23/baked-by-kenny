import { NextResponse } from "next/server";
import { getPricing } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json(await getPricing());
  } catch {
    return NextResponse.json({ error: "Could not load prices" }, { status: 500 });
  }
}
