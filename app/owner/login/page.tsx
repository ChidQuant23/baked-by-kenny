"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import CakeMark from "../../components/CakeMark";
import { C } from "@/lib/constants";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", fontSize: 17, color: C.ink,
  background: "#fff", border: `1.5px solid ${C.peachDeep}`, borderRadius: 10,
  outline: "none", textAlign: "center",
};

export default function LoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        router.replace("/owner");
        router.refresh();
      } else {
        setErr("Wrong password — try again.");
        setPw("");
      }
    } catch {
      setErr("Couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: C.maroon, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center", color: C.cream }}>
        <CakeMark size={56} color={C.cream} />
        <h1 className="bbk-display" style={{ fontSize: 34, margin: "14px 0 4px" }}>Owner login</h1>
        <p style={{ fontSize: 18, opacity: .7, marginBottom: 24 }}>Enter your password to manage orders.</p>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input type={show ? "text" : "password"} value={pw} autoFocus
            onChange={(e) => { setPw(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Password" style={{ ...inputStyle, paddingRight: 44 }} />
          <button onClick={() => setShow((s) => !s)} aria-label="Show password"
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.ink, opacity: .6 }}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {err && <p style={{ color: "#ffd0d0", fontSize: 16, margin: "0 0 12px" }}>{err}</p>}
        <button onClick={submit} disabled={busy} style={{ width: "100%", background: C.cream, color: C.maroon, border: "none", padding: 14, borderRadius: 12, fontSize: 19, fontWeight: 700, cursor: busy ? "wait" : "pointer", opacity: busy ? .7 : 1 }}>
          {busy ? "Checking…" : "Log in"}
        </button>
        <a href="/" style={{ display: "inline-block", color: C.cream, opacity: .6, marginTop: 16, fontSize: 16, textDecoration: "none" }}>← Back to site</a>
      </div>
    </div>
  );
}
