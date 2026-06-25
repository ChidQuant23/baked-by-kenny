"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { Trash2, Upload, ImagePlus } from "lucide-react";
import { C, type GalleryPhoto } from "@/lib/constants";

export default function GalleryManager({ initialPhotos }: { initialPhotos: GalleryPhoto[] }) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true); setError("");
    const added: GalleryPhoto[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(`Uploading ${i + 1} of ${files.length}…`);
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/gallery/upload",
        });
        const res = await fetch("/api/admin/gallery", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: blob.url, caption: i === 0 ? caption : "" }),
        });
        if (res.ok) added.push(await res.json());
      }
      setPhotos((p) => [...added, ...p]);
      setCaption("");
    } catch (err) {
      console.error(err);
      setError("Upload failed. If this is local, make sure the Blob token is set (see README).");
    } finally {
      setBusy(false); setProgress("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (id: string) => {
    setPhotos((p) => p.filter((x) => x.id !== id));
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
  };

  return (
    <div>
      <p style={{ fontSize: 18, opacity: .8, marginTop: 0 }}>
        Upload photos of your cakes — they appear on your public gallery page straight away. You can add as many as you like, whenever you like.
      </p>

      <div style={{ background: "#fff", border: `1.5px solid ${C.peachDeep}`, borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Caption (optional)</label>
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Two-tier wedding cake"
          style={{ width: "100%", padding: "11px 13px", fontSize: 17, color: C.ink, background: "#fff", border: `1.5px solid ${C.peachDeep}`, borderRadius: 10, outline: "none", marginBottom: 14 }} />

        <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPick} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} disabled={busy}
          style={{ background: C.maroon, color: C.cream, border: "none", padding: "13px 22px", borderRadius: 12, fontSize: 18, fontWeight: 700, cursor: busy ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: busy ? .7 : 1 }}>
          {busy ? <Upload size={18} className="bbk-spin" /> : <ImagePlus size={18} />}
          {busy ? (progress || "Uploading…") : "Choose photos to upload"}
        </button>
        {error && <p style={{ color: "#a23", fontSize: 16, marginTop: 12 }}>{error}</p>}
      </div>

      {photos.length === 0 ? (
        <p style={{ fontSize: 18, opacity: .7, textAlign: "center", padding: "30px 0" }}>No photos yet — upload your first above.</p>
      ) : (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
          {photos.map((p) => (
            <div key={p.id} style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "#fff", border: `1px solid ${C.peachDeep}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption || "Cake"} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
              {p.caption && <p style={{ fontSize: 14, padding: "6px 10px", margin: 0 }}>{p.caption}</p>}
              <button onClick={() => remove(p.id)} aria-label="Delete photo"
                style={{ position: "absolute", top: 8, right: 8, background: "rgba(74,26,38,0.85)", color: "#fff", border: "none", width: 32, height: 32, borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}