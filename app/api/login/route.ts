import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { createSessionToken, cookieOptions } from "@/lib/session";

function matches(input: string, expected: string) {
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const expected = process.env.OWNER_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!password || !matches(String(password), expected)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...cookieOptions, value: token });
  return res;
}
