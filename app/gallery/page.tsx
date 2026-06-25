import Link from "next/link";
import { listPhotos } from "@/lib/db";
import { BUSINESS_NAME, C, type GalleryPhoto } from "@/lib/constants";
import CakeMark from "../components/CakeMark";

export const dynamic = "force-dynamic";
export const metadata = { title: `Gallery — ${BUSINESS_NAME}` };

export default async function GalleryPage() {
  let photos: GalleryPhoto[] = [];
  try { photos = await listPhotos(); } catch {}

  return (
    <div style={{ background: C.peach, minHeight: "100vh", color: C.maroon, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px clamp(16px,5vw,56px)", maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: C.maroon }}>
          <CakeMark size={42} />
          <span className="bbk-script" style={{ fontSize: 38 }}>{BUSINESS_NAME}</span>
        </Link>
        <Link href="/#enquire" style={{ color: C.maroon, fontSize: 18, textDecoration: "none", fontWeight: 600 }}>Order →</Link>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "30px clamp(16px,5vw,56px) 70px" }}>
        <h1 className="bbk-display" style={{ fontSize: "clamp(36px,7vw,64px)", fontWeight: 700, margin: "0 0 8px", textAlign: "center" }}>
          Our cakes
        </h1>
        <p style={{ fontSize: 21, opacity: .8, textAlign: "center", margin: "0 0 36px" }}>
          A few of the cakes we've made. Like something? <Link href="/#enquire" style={{ color: C.maroon }}>Send an enquiry.</Link>
        </p>

        {photos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 20px", opacity: .7 }}>
            <CakeMark size={48} />
            <p className="bbk-display" style={{ fontSize: 26, margin: "12px 0 0" }}>Photos coming soon</p>
          </div>
        ) : (
          <div style={{ columnWidth: 280, columnGap: 16 }}>
            {photos.map((p) => (
              <figure key={p.id} style={{ margin: "0 0 16px", breakInside: "avoid", borderRadius: 16, overflow: "hidden", background: "#fff", border: `1px solid ${C.peachDeep}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.caption || "Cake by Baked by Kenny"} loading="lazy" style={{ width: "100%", display: "block" }} />
                {p.caption && <figcaption style={{ padding: "10px 14px", fontSize: 17 }}>{p.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}