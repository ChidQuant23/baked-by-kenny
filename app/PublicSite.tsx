"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Lock, CheckCircle2, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import CakeMark from "./components/CakeMark";
import { BUSINESS_NAME, CURRENCY, C, type Pricing, type Product } from "@/lib/constants";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", fontSize: 17, color: C.ink,
  background: "#fff", border: `1.5px solid ${C.peachDeep}`, borderRadius: 10,
  outline: "none",
};

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ display: "block", fontSize: 17, color: C.maroon, marginBottom: 5, fontWeight: 600 }}>{label}</span>
      {children}
      {error && (
        <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#a23", fontSize: 14, marginTop: 4 }}>
          <AlertCircle size={13} /> {error}
        </span>
      )}
    </label>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [busy, setBusy] = useState(false);
  const buy = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout/product", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setBusy(false);
    } catch { setBusy(false); }
  };
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${C.peachDeep}`, borderRadius: 16, padding: 22, display: "flex", flexDirection: "column" }}>
      <h3 className="bbk-display" style={{ fontSize: 24, margin: "0 0 4px", fontWeight: 700 }}>{product.name}</h3>
      <p style={{ fontSize: 17, opacity: .8, margin: "0 0 6px", flexGrow: 1 }}>{product.description}</p>
      {product.allergens && <p style={{ fontSize: 14, opacity: .6, margin: "0 0 14px" }}>{product.allergens}</p>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span className="bbk-display" style={{ fontSize: 28, fontWeight: 700 }}>{CURRENCY}{product.price}</span>
        <button onClick={buy} disabled={busy} style={{ background: C.maroon, color: C.cream, border: "none", padding: "10px 20px", borderRadius: 999, fontSize: 18, fontWeight: 700, cursor: busy ? "wait" : "pointer", opacity: busy ? .7 : 1 }}>
          {busy ? "…" : "Buy now"}
        </button>
      </div>
    </div>
  );
}

export default function PublicSite({ pricing, products }: { pricing: Pricing; products: Product[] }) {
  const [size, setSize] = useState(pricing.sizes[1]?.id ?? pricing.sizes[0].id);
  const [flavour, setFlavour] = useState(pricing.flavours[0].id);

  const selSize = pricing.sizes.find((s) => s.id === size) || pricing.sizes[0];
  const selFlav = pricing.flavours.find((f) => f.id === flavour) || pricing.flavours[0];
  const price = selSize.base + selFlav.add;

  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", collection: "", details: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [orderToken, setOrderToken] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = "Please add a name";
    if (!form.email.trim() && !form.phone.trim()) er.email = "Add an email or phone so Kenny can reply";
    else if (form.email && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) er.email = "That email doesn't look right";
    if (!form.collection) er.collection = "When would you like to collect it?";
    setErrors(er);
    if (Object.keys(er).length) return;

    setSending(true); setFailed(false);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone,
          sizeId: size, sizeName: selSize.name,
          flavourId: flavour, flavourName: selFlav.name,
          estimate: price, dateNeeded: form.date, collectionDate: form.collection,
          details: form.details,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json().catch(() => ({}));
      if (data.token) setOrderToken(data.token);
      setSent(true);
      setForm({ name: "", email: "", phone: "", date: "", collection: "", details: "" });
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  const selBtn = (active: boolean): React.CSSProperties => ({
    textAlign: "left", cursor: "pointer", padding: "11px 15px", borderRadius: 12,
    border: `1.5px solid ${active ? C.cream : "rgba(247,228,212,.25)"}`,
    background: active ? "rgba(247,228,212,.12)" : "transparent",
    color: C.cream, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 18,
  });

  return (
    <div style={{ background: C.peach, minHeight: "100vh", color: C.maroon }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px clamp(16px,5vw,56px)", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CakeMark size={38} />
          <span className="bbk-script" style={{ fontSize: 34, color: C.maroon, lineHeight: 1 }}>{BUSINESS_NAME}</span>
        </div>
        <nav style={{ display: "flex", gap: 22, fontSize: 18, alignItems: "center" }}>
          <a href="#prices" style={{ textDecoration: "none", fontWeight: 600 }}>Prices</a>
          {products.length > 0 && <a href="#shop" style={{ textDecoration: "none", fontWeight: 600 }}>Shop</a>}
          <a href="#enquire" style={{ textDecoration: "none", fontWeight: 600 }}>Order</a>
        </nav>
      </header>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(36px,7vw,90px) clamp(16px,5vw,56px) 40px", textAlign: "center" }}>
        <p style={{ fontSize: 21, letterSpacing: 2, textTransform: "uppercase", opacity: .7, marginBottom: 10 }}>Handmade custom cakes</p>
        <h1 className="bbk-display" style={{ fontSize: "clamp(44px,9vw,86px)", lineHeight: 1.02, fontWeight: 700, margin: "0 0 18px" }}>
          Made to order,<br />baked with love
        </h1>
        <p style={{ fontSize: 22, maxWidth: 560, margin: "0 auto 28px", opacity: .85 }}>
          Pick a size and a flavour to see a starting price, then send Kenny the details for your cake.
        </p>
        <a href="#prices" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.maroon, color: C.cream, padding: "13px 26px", borderRadius: 999, fontSize: 19, textDecoration: "none", fontWeight: 600 }}>
          See prices <ChevronRight size={18} />
        </a>
      </section>

      <section id="prices" style={{ maxWidth: 1100, margin: "0 auto", padding: "30px clamp(16px,5vw,56px)" }}>
        <div style={{ background: C.maroon, color: C.cream, borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 60px -30px rgba(74,26,38,.55)" }}>
          <div style={{ padding: "clamp(26px,5vw,46px)" }}>
            <h2 className="bbk-display" style={{ fontSize: "clamp(32px,5vw,48px)", margin: "0 0 6px", fontWeight: 700 }}>Price list</h2>
            <p style={{ fontSize: 20, opacity: .8, margin: "0 0 30px" }}>Prices start from… choose to see yours.</p>
            <div style={{ display: "grid", gap: 26 }}>
              <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                <div>
                  <p style={{ fontSize: 17, letterSpacing: 1, textTransform: "uppercase", opacity: .65, marginBottom: 10 }}>Size</p>
                  <div style={{ display: "grid", gap: 8 }}>
                    {pricing.sizes.map((s) => (
                      <button key={s.id} onClick={() => setSize(s.id)} style={selBtn(size === s.id)}>
                        <span>{s.name}<span style={{ opacity: .6, fontSize: 15 }}> · serves {s.serves}</span></span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 17, letterSpacing: 1, textTransform: "uppercase", opacity: .65, marginBottom: 10 }}>Flavour</p>
                  <div style={{ display: "grid", gap: 8 }}>
                    {pricing.flavours.map((f) => (
                      <button key={f.id} onClick={() => setFlavour(f.id)} style={selBtn(flavour === f.id)}>
                        <span>{f.name}</span>
                        {f.add > 0 && <span style={{ opacity: .6, fontSize: 15 }}>+{CURRENCY}{f.add}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(247,228,212,.25)", paddingTop: 24, display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 18, opacity: .75, margin: 0 }}>{selSize.name} · {selFlav.name}</p>
                  <p style={{ fontSize: 15, opacity: .55, margin: "2px 0 0" }}>Starting price — final quote depends on design &amp; decoration</p>
                </div>
                <p className="bbk-display" style={{ fontSize: 56, fontWeight: 700, margin: 0, lineHeight: 1 }}>{CURRENCY}{price}</p>
              </div>
              <a href="#enquire" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.cream, color: C.maroon, padding: "13px 22px", borderRadius: 999, fontSize: 19, textDecoration: "none", fontWeight: 700 }}>
                Enquire about this cake <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* shop — standard items, instant checkout */}
      {products.length > 0 && (
        <section id="shop" style={{ maxWidth: 1100, margin: "0 auto", padding: "50px clamp(16px,5vw,56px) 10px" }}>
          <h2 className="bbk-display" style={{ fontSize: "clamp(30px,5vw,44px)", margin: "0 0 6px", fontWeight: 700, textAlign: "center" }}>
            Ready to order
          </h2>
          <p style={{ fontSize: 19, opacity: .8, textAlign: "center", margin: "0 0 28px" }}>
            Standard treats you can buy and pay for now — no enquiry needed.
          </p>
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section id="enquire" style={{ maxWidth: 640, margin: "0 auto", padding: "50px clamp(16px,5vw,56px) 30px" }}>
        <h2 className="bbk-display" style={{ fontSize: "clamp(30px,5vw,44px)", margin: "0 0 6px", fontWeight: 700, textAlign: "center" }}>Send your enquiry</h2>
        <p style={{ fontSize: 19, opacity: .8, textAlign: "center", margin: "0 0 28px" }}>Kenny gets an email the moment you submit and will reply to confirm.</p>

        {sent ? (
          <div className="bbk-fade" style={{ background: "#fff", border: `1.5px solid ${C.peachDeep}`, borderRadius: 18, padding: 32, textAlign: "center" }}>
            <CheckCircle2 size={46} color="#2f5a34" style={{ margin: "0 auto 12px", display: "block" }} />
            <h3 className="bbk-display" style={{ fontSize: 28, margin: "0 0 8px" }}>Enquiry sent!</h3>
            <p style={{ fontSize: 19, opacity: .8, margin: "0 0 20px" }}>Thanks — Kenny has been notified and will be in touch soon to confirm your cake. Once you've agreed the details, you'll be able to pay here.</p>
            {orderToken && (
              <a href={`/order/${orderToken}`} style={{ display: "inline-block", background: C.peach, color: C.maroon, padding: "10px 20px", borderRadius: 999, fontSize: 17, textDecoration: "none", fontWeight: 600, marginBottom: 14 }}>
                View &amp; track your order
              </a>
            )}
            <div>
              <button onClick={() => setSent(false)} style={{ background: C.maroon, color: C.cream, border: "none", padding: "11px 22px", borderRadius: 999, fontSize: 18, cursor: "pointer", fontWeight: 600 }}>Send another</button>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", border: `1.5px solid ${C.peachDeep}`, borderRadius: 18, padding: "clamp(20px,4vw,32px)" }}>
            <Field label="Your name" error={errors.name}>
              <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="e.g. Sara Bell" />
            </Field>
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
              <Field label="Email" error={errors.email}>
                <input style={inputStyle} value={form.email} onChange={set("email")} placeholder="you@email.com" inputMode="email" />
              </Field>
              <Field label="Phone (optional)">
                <input style={inputStyle} value={form.phone} onChange={set("phone")} placeholder="07…" inputMode="tel" />
              </Field>
            </div>
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
              <Field label="Cake size">
                <select style={inputStyle} value={size} onChange={(e) => setSize(e.target.value)}>
                  {pricing.sizes.map((s) => <option key={s.id} value={s.id}>{s.name} · serves {s.serves}</option>)}
                </select>
              </Field>
              <Field label="Flavour">
                <select style={inputStyle} value={flavour} onChange={(e) => setFlavour(e.target.value)}>
                  {pricing.flavours.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
              <Field label="Date needed (optional)">
                <input type="date" style={inputStyle} value={form.date} onChange={set("date")} />
              </Field>
              <Field label="Collection date" error={errors.collection}>
                <input type="date" style={inputStyle} value={form.collection} onChange={set("collection")} />
              </Field>
            </div>
            <Field label="Design, message & details">
              <textarea style={{ ...inputStyle, minHeight: 96, resize: "vertical" }} value={form.details} onChange={set("details")}
                placeholder="Colours, theme, writing on the cake, allergies, anything else…" />
            </Field>

            <div style={{ background: C.peach, borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>Estimated starting price</span>
              <span className="bbk-display" style={{ fontSize: 26, fontWeight: 700 }}>{CURRENCY}{price}</span>
            </div>

            {failed && (
              <p style={{ color: "#a23", fontSize: 16, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={15} /> Something went wrong sending that. Please try again.
              </p>
            )}

            <button onClick={submit} disabled={sending} style={{ width: "100%", background: C.maroon, color: C.cream, border: "none", padding: 15, borderRadius: 12, fontSize: 20, fontWeight: 700, cursor: sending ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: sending ? .7 : 1 }}>
              {sending ? <RefreshCw size={18} className="bbk-spin" /> : <Send size={18} />}
              {sending ? "Sending…" : "Send enquiry"}
            </button>
          </div>
        )}
      </section>

      <footer style={{ maxWidth: 1100, margin: "40px auto 0", padding: "28px clamp(16px,5vw,56px) 40px", borderTop: `1px solid ${C.peachDeep}`, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span className="bbk-script" style={{ fontSize: 28 }}>{BUSINESS_NAME}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link href="/policies" style={{ color: C.maroon, opacity: .55, fontSize: 15, textDecoration: "none" }}>
            Policies &amp; allergens
          </Link>
          <Link href="/owner" style={{ color: C.maroon, opacity: .45, fontSize: 15, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
            <Lock size={13} /> Owner login
          </Link>
        </div>
      </footer>
    </div>
  );
}
