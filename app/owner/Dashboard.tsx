"use client";
import GalleryManager from "./GalleryManager";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Trash2, Phone, Mail, CheckCircle2, Bell, Copy, Check, Plus,
} from "lucide-react";
import CakeMark from "../components/CakeMark";
import {
  BUSINESS_NAME, CURRENCY, C, STATUSES, STATUS_STYLE,
  type Enquiry, type Pricing, type Product, type Status, type GalleryPhoto
} from "@/lib/constants";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", fontSize: 17, color: C.ink,
  background: "#fff", border: `1.5px solid ${C.peachDeep}`, borderRadius: 10, outline: "none",
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—";
const daysUntil = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
};
const uid = () => Math.random().toString(36).slice(2, 8);

function Pill({ status }: { status: Status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.New;
  return <span style={{ background: s.bg, color: s.fg, padding: "3px 11px", borderRadius: 999, fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }}>{status}</span>;
}

function PayPill({ e }: { e: Enquiry }) {
  if (e.paymentStatus === "paid")
    return <span style={{ background: "rgba(46,90,52,0.16)", color: "#2f5a34", padding: "3px 11px", borderRadius: 999, fontSize: 15, fontWeight: 700 }}>Paid {CURRENCY}{e.quote ?? e.estimate}</span>;
  if (e.quote != null)
    return <span style={{ background: "rgba(201,123,90,0.22)", color: "#7a3417", padding: "3px 11px", borderRadius: 999, fontSize: 15, fontWeight: 600 }}>Awaiting payment {CURRENCY}{e.quote}</span>;
  return <span style={{ background: "rgba(74,26,38,0.08)", color: "#9a7d72", padding: "3px 11px", borderRadius: 999, fontSize: 15, fontWeight: 600 }}>Not priced</span>;
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", opacity: .7 }}>
      <div style={{ display: "inline-flex", marginBottom: 12 }}>{icon}</div>
      <h3 className="bbk-display" style={{ fontSize: 26, margin: "0 0 6px" }}>{title}</h3>
      <p style={{ fontSize: 18, maxWidth: 360, margin: "0 auto" }}>{body}</p>
    </div>
  );
}

export default function Dashboard({
  initialEnquiries, initialPricing, initialProducts, initialPhotos,
}: { initialEnquiries: Enquiry[]; initialPricing: Pricing; initialProducts: Product[]; initialPhotos: GalleryPhoto[] }) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [pricing, setPricing] = useState<Pricing>(initialPricing);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [tab, setTab] = useState<"orders" | "upcoming" | "shop" | "gallery" | "pricing">("orders");
  const [filter, setFilter] = useState<string>("All");

  const newCount = enquiries.filter((e) => !e.seen).length;
  useEffect(() => {
    if (newCount > 0) fetch("/api/admin/seen", { method: "POST" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upcoming = useMemo(
    () => enquiries.filter((e) => e.status !== "Collected" && e.collectionDate),
    [enquiries]
  );
  const visible = filter === "All" ? enquiries : enquiries.filter((e) => e.status === filter);

  const updateStatus = async (id: string, status: Status) => {
    setEnquiries((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));
    await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
  };
  const saveQuote = async (id: string, quote: number, notify: boolean) => {
    setEnquiries((list) => list.map((e) => (e.id === id ? { ...e, quote } : e)));
    await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quote, notify }),
    });
  };
  const remove = async (id: string) => {
    setEnquiries((list) => list.filter((e) => e.id !== id));
    await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
  };
  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/"); router.refresh();
  };

  return (
    <div style={{ background: C.peach, minHeight: "100vh", color: C.maroon }}>
      <header style={{ background: C.maroon, color: C.cream, padding: "16px clamp(16px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CakeMark size={32} color={C.cream} />
          <span className="bbk-script" style={{ fontSize: 28 }}>{BUSINESS_NAME}</span>
          <span style={{ fontSize: 16, opacity: .6, marginLeft: 4 }}>· Owner</span>
        </div>
        <button onClick={logout} style={{ background: "rgba(247,228,212,.15)", color: C.cream, border: "none", padding: "8px 16px", borderRadius: 999, fontSize: 16, cursor: "pointer" }}>Log out</button>
      </header>

      <div style={{ display: "flex", gap: 6, padding: "16px clamp(16px,4vw,40px) 0", maxWidth: 1000, margin: "0 auto", flexWrap: "wrap" }}>
        {([
          ["orders", "All orders", enquiries.length],
          ["upcoming", "Upcoming collections", upcoming.length],
          ["shop", "Standard items", null],
          ["gallery", "Gallery", null],
          ["pricing", "Edit prices", null],
        ] as const).map(([id, label, count]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: tab === id ? C.maroon : "transparent", color: tab === id ? C.cream : C.maroon,
            border: `1.5px solid ${C.maroon}`, padding: "9px 16px", borderRadius: "12px 12px 0 0",
            fontSize: 17, fontWeight: 600, cursor: "pointer",
          }}>
            {label}{count != null && ` (${count})`}
            {id === "orders" && newCount > 0 && (
              <span style={{ marginLeft: 7, background: C.accent, color: "#fff", borderRadius: 999, padding: "1px 8px", fontSize: 14, fontWeight: 700 }}>{newCount} new</span>
            )}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "0 clamp(16px,4vw,40px) 60px" }}>
        <div style={{ borderTop: `1.5px solid ${C.maroon}`, paddingTop: 24 }}>

          {tab === "orders" && (
            <>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 20 }}>
                {["All", ...STATUSES].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? C.maroon : "#fff", color: filter === f ? C.cream : C.maroon, border: `1.5px solid ${C.maroon}`, padding: "6px 14px", borderRadius: 999, fontSize: 16, cursor: "pointer" }}>{f}</button>
                ))}
              </div>
              {visible.length === 0 ? (
                <EmptyState icon={<Bell size={40} />} title={filter === "All" ? "No orders yet" : `No ${filter.toLowerCase()} orders`}
                  body="Enquiries and instant purchases from the website both land here." />
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {visible.map((e) => (
                    <OrderCard key={e.id} e={e} onStatus={updateStatus} onDelete={remove} onQuote={saveQuote} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "upcoming" && (
            upcoming.length === 0 ? (
              <EmptyState icon={<Calendar size={40} />} title="Nothing scheduled" body="Orders with a collection date show up here, soonest first." />
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {upcoming.map((e) => {
                  const d = daysUntil(e.collectionDate);
                  const soon = d != null && d <= 3;
                  return (
                    <div key={e.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", borderLeft: `5px solid ${soon ? C.accent : C.maroon}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <p className="bbk-display" style={{ fontSize: 22, margin: "0 0 2px", fontWeight: 600 }}>{e.name} · {e.sizeName}</p>
                        <p style={{ fontSize: 17, opacity: .75, margin: 0, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}><PayPill e={e} /> <Pill status={e.status} /></p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p className="bbk-display" style={{ fontSize: 19, margin: 0, fontWeight: 600, color: soon ? "#a8482a" : C.maroon }}>{fmtDate(e.collectionDate)}</p>
                        <p style={{ fontSize: 15, opacity: .7, margin: 0 }}>{d === 0 ? "Today" : d === 1 ? "Tomorrow" : (d != null && d > 0) ? `In ${d} days` : `${d != null ? -d : ""} days ago`}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {tab === "gallery" && <GalleryManager initialPhotos={initialPhotos} />}
          {tab === "shop" && <ProductsEditor products={initialProducts} />}
          {tab === "pricing" && <PricingEditor pricing={pricing} onSaved={setPricing} />}
        </div>
      </main>
    </div>
  );
}

function OrderCard({ e, onStatus, onDelete, onQuote }: {
  e: Enquiry; onStatus: (id: string, s: Status) => void; onDelete: (id: string) => void;
  onQuote: (id: string, quote: number, notify: boolean) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [price, setPrice] = useState(e.quote != null ? String(e.quote) : "");
  const [copied, setCopied] = useState(false);
  const isStandard = e.source === "standard";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/order/${e.token}`);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: !e.seen ? `1.5px solid ${C.accent}` : `1px solid ${C.peachDeep}`, position: "relative" }}>
      {!e.seen && <span style={{ position: "absolute", top: -10, left: 18, background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, padding: "2px 10px", borderRadius: 999 }}>NEW</span>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 className="bbk-display" style={{ fontSize: 24, margin: "0 0 2px", fontWeight: 600 }}>
            {e.name} {isStandard && <span style={{ fontSize: 14, background: C.peach, padding: "2px 8px", borderRadius: 999, verticalAlign: "middle" }}>instant order</span>}
          </h3>
          <p style={{ fontSize: 17, opacity: .8, margin: 0 }}>{[e.sizeName, e.flavourName].filter((x) => x && x !== "Standard item").join(" · ") || e.sizeName}</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}><PayPill e={e} /><Pill status={e.status} /></div>
      </div>

      <div style={{ display: "grid", gap: 4, margin: "12px 0", fontSize: 17 }}>
        {e.email && <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Mail size={15} /> <a href={`mailto:${e.email}`} style={{ color: C.maroon }}>{e.email}</a></span>}
        {e.phone && <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Phone size={15} /> <a href={`tel:${e.phone}`} style={{ color: C.maroon }}>{e.phone}</a></span>}
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Calendar size={15} /> Collect: <strong>{fmtDate(e.collectionDate)}</strong>
          {e.dateNeeded && <span style={{ opacity: .6 }}> · needed {fmtDate(e.dateNeeded)}</span>}
        </span>
      </div>

      {e.details && <p style={{ fontSize: 17, background: C.peach, padding: "10px 14px", borderRadius: 10, margin: "0 0 14px", whiteSpace: "pre-wrap" }}>{e.details}</p>}

      {/* pricing / payment controls — only for bespoke, unpaid orders */}
      {!isStandard && e.paymentStatus !== "paid" && (
        <div style={{ background: C.peach, borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Agreed price</span>
          <div style={{ position: "relative", width: 110 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{CURRENCY}</span>
            <input type="number" value={price} onChange={(ev) => setPrice(ev.target.value)} placeholder="0"
              style={{ ...inputStyle, paddingLeft: 24, padding: "8px 10px 8px 24px" }} />
          </div>
          <button onClick={() => onQuote(e.id, Math.round(Number(price) || 0), Boolean(e.email))}
            disabled={!price} style={{ background: C.maroon, color: C.cream, border: "none", padding: "9px 14px", borderRadius: 999, fontSize: 16, fontWeight: 600, cursor: price ? "pointer" : "not-allowed", opacity: price ? 1 : .5 }}>
            {e.email ? "Save & email link" : "Save price"}
          </button>
          {e.quote != null && (
            <button onClick={copyLink} style={{ background: "transparent", color: C.maroon, border: `1.5px solid ${C.maroon}`, padding: "9px 14px", borderRadius: 999, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy pay link</>}
            </button>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => onStatus(e.id, s)} style={{ background: e.status === s ? C.maroon : "transparent", color: e.status === s ? C.cream : C.maroon, border: `1.5px solid ${C.maroon}`, padding: "5px 12px", borderRadius: 999, fontSize: 15, cursor: "pointer" }}>{s}</button>
          ))}
        </div>
        {confirm ? (
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 15 }}>Delete?</span>
            <button onClick={() => onDelete(e.id)} style={{ background: "#a23", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 8, fontSize: 15, cursor: "pointer" }}>Yes</button>
            <button onClick={() => setConfirm(false)} style={{ background: "none", border: "none", color: C.maroon, fontSize: 15, cursor: "pointer" }}>No</button>
          </span>
        ) : (
          <button onClick={() => setConfirm(true)} style={{ background: "none", border: "none", color: "#a23", opacity: .7, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 15 }}>
            <Trash2 size={15} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

function ProductsEditor({ products }: { products: Product[] }) {
  const [list, setList] = useState<Product[]>(products);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const upd = (i: number, key: keyof Product, val: string | number | boolean) =>
    setList((l) => l.map((p, idx) => (idx === i ? { ...p, [key]: val } : p)));
  const add = () => setList((l) => [...l, { id: uid(), name: "New item", description: "", price: 10, allergens: "", active: true }]);
  const remove = (i: number) => setList((l) => l.filter((_, idx) => idx !== i));
  const save = async () => {
    setBusy(true);
    const res = await fetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(list) });
    setBusy(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <div>
      <p style={{ fontSize: 18, opacity: .8, marginTop: 0 }}>
        Fixed-price treats customers can buy and pay for instantly. Untick “Listed” to hide one without deleting it.
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        {list.map((p, i) => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "2fr 1fr", alignItems: "center" }}>
              <input style={inputStyle} value={p.name} onChange={(e) => upd(i, "name", e.target.value)} placeholder="Item name" />
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 17 }}>{CURRENCY}</span>
                <input type="number" style={{ ...inputStyle, paddingLeft: 26 }} value={p.price} onChange={(e) => upd(i, "price", Number(e.target.value) || 0)} />
              </div>
            </div>
            <input style={inputStyle} value={p.description} onChange={(e) => upd(i, "description", e.target.value)} placeholder="Short description" />
            <input style={inputStyle} value={p.allergens} onChange={(e) => upd(i, "allergens", e.target.value)} placeholder="Allergens, e.g. Contains wheat, egg, milk" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, cursor: "pointer" }}>
                <input type="checkbox" checked={p.active} onChange={(e) => upd(i, "active", e.target.checked)} style={{ width: 18, height: 18 }} /> Listed on site
              </label>
              <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#a23", opacity: .7, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 15 }}>
                <Trash2 size={15} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <button onClick={add} style={{ background: "transparent", color: C.maroon, border: `1.5px solid ${C.maroon}`, padding: "11px 18px", borderRadius: 12, fontSize: 17, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={17} /> Add item
        </button>
        <button onClick={save} disabled={busy} style={{ background: C.maroon, color: C.cream, border: "none", padding: "11px 22px", borderRadius: 12, fontSize: 18, fontWeight: 700, cursor: busy ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: busy ? .7 : 1 }}>
          {saved ? <><CheckCircle2 size={18} /> Saved</> : busy ? "Saving…" : "Save items"}
        </button>
      </div>
    </div>
  );
}

function PricingEditor({ pricing, onSaved }: { pricing: Pricing; onSaved: (p: Pricing) => void }) {
  const [draft, setDraft] = useState<Pricing>(pricing);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const upd = (group: "sizes" | "flavours", idx: number, key: string, val: string | number) =>
    setDraft((d) => ({ ...d, [group]: d[group].map((it, i) => (i === idx ? { ...it, [key]: val } : it)) } as Pricing));

  const save = async () => {
    setBusy(true);
    const res = await fetch("/api/admin/pricing", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    setBusy(false);
    if (res.ok) { onSaved(draft); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <div>
      <p style={{ fontSize: 18, opacity: .8, marginTop: 0 }}>Base price per size and the extra for each flavour. These drive the calculator on the public site.</p>
      <h3 className="bbk-display" style={{ fontSize: 24, margin: "22px 0 10px" }}>Sizes</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {draft.sizes.map((s, i) => (
          <div key={s.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", display: "grid", gap: 10, gridTemplateColumns: "1.4fr 1fr 0.9fr", alignItems: "center" }}>
            <input style={inputStyle} value={s.name} onChange={(e) => upd("sizes", i, "name", e.target.value)} />
            <input style={inputStyle} value={s.serves} onChange={(e) => upd("sizes", i, "serves", e.target.value)} placeholder="serves" />
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 17 }}>{CURRENCY}</span>
              <input type="number" style={{ ...inputStyle, paddingLeft: 26 }} value={s.base} onChange={(e) => upd("sizes", i, "base", Number(e.target.value) || 0)} />
            </div>
          </div>
        ))}
      </div>
      <h3 className="bbk-display" style={{ fontSize: 24, margin: "26px 0 10px" }}>Flavours</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {draft.flavours.map((f, i) => (
          <div key={f.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", display: "grid", gap: 10, gridTemplateColumns: "2fr 1fr", alignItems: "center" }}>
            <input style={inputStyle} value={f.name} onChange={(e) => upd("flavours", i, "name", e.target.value)} />
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 17 }}>+{CURRENCY}</span>
              <input type="number" style={{ ...inputStyle, paddingLeft: 36 }} value={f.add} onChange={(e) => upd("flavours", i, "add", Number(e.target.value) || 0)} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={save} disabled={busy} style={{ marginTop: 24, background: C.maroon, color: C.cream, border: "none", padding: "13px 26px", borderRadius: 12, fontSize: 19, fontWeight: 700, cursor: busy ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: busy ? .7 : 1 }}>
        {saved ? <><CheckCircle2 size={18} /> Saved</> : busy ? "Saving…" : "Save prices"}
      </button>
    </div>
  );
}
