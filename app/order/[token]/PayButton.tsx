"use client";

import { useState } from "react";
import { CURRENCY, C } from "@/lib/constants";

export default function PayButton({ token, amount }: { token: string; amount: number }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pay = async () => {
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/checkout/order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { setErr(data.error || "Something went wrong."); setBusy(false); }
    } catch {
      setErr("Couldn't reach the payment page. Try again."); setBusy(false);
    }
  };

  return (
    <div>
      <button onClick={pay} disabled={busy} style={{
        width: "100%", background: C.maroon, color: C.cream, border: "none",
        padding: 16, borderRadius: 12, fontSize: 20, fontWeight: 700,
        cursor: busy ? "wait" : "pointer", opacity: busy ? .7 : 1,
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}>
        {busy ? "Taking you to checkout…" : `Pay ${CURRENCY}${amount}`}
      </button>
      {err && <p style={{ color: "#a23", fontSize: 16, marginTop: 10, textAlign: "center" }}>{err}</p>}
      <p style={{ opacity: .6, fontSize: 14, textAlign: "center", marginTop: 12 }}>
        Secure payment by card via Stripe.
      </p>
    </div>
  );
}
