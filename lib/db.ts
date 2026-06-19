import postgres from "postgres";
import {
  DEFAULT_PRICING, DEFAULT_PRODUCTS,
  type Enquiry, type Pricing, type Product, type Status, type PaymentStatus, type Source,
} from "./constants";
import { randomBytes } from "crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("DATABASE_URL is not set — database calls will fail.");
}

const globalForSql = globalThis as unknown as { sql?: ReturnType<typeof postgres> };
export const sql =
  globalForSql.sql ??
  postgres(connectionString ?? "", { ssl: "require", max: 1, idle_timeout: 20 });
if (process.env.NODE_ENV !== "production") globalForSql.sql = sql;

const newToken = () => randomBytes(18).toString("base64url");

let schemaReady = false;
export async function ensureSchema() {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS enquiries (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      email           TEXT,
      phone           TEXT,
      size_id         TEXT,
      size_name       TEXT,
      flavour_id      TEXT,
      flavour_name    TEXT,
      estimate        INTEGER,
      date_needed     DATE,
      collection_date DATE,
      details         TEXT,
      status          TEXT NOT NULL DEFAULT 'New',
      seen            BOOLEAN NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value JSONB NOT NULL
    )`;
  // Migrations for the payment features (safe to run repeatedly).
  await sql`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS token TEXT`;
  await sql`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'enquiry'`;
  await sql`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS quote INTEGER`;
  await sql`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid'`;
  await sql`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ`;
  await sql`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS stripe_session_id TEXT`;
  await sql`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT`;
  // Backfill tokens for any rows created before this column existed.
  const missing = await sql`SELECT id FROM enquiries WHERE token IS NULL`;
  for (const row of missing) {
    await sql`UPDATE enquiries SET token = ${newToken()} WHERE id = ${row.id as string}`;
  }
  schemaReady = true;
}

const toIso = (d: unknown) =>
  d == null ? null : typeof d === "string" ? d.slice(0, 10) : new Date(d as Date).toISOString().slice(0, 10);

function rowToEnquiry(r: Record<string, unknown>): Enquiry {
  return {
    id: r.id as string,
    name: r.name as string,
    email: (r.email as string) ?? null,
    phone: (r.phone as string) ?? null,
    sizeId: (r.size_id as string) ?? "",
    sizeName: (r.size_name as string) ?? "",
    flavourId: (r.flavour_id as string) ?? "",
    flavourName: (r.flavour_name as string) ?? "",
    estimate: Number(r.estimate ?? 0),
    dateNeeded: toIso(r.date_needed),
    collectionDate: toIso(r.collection_date),
    details: (r.details as string) ?? null,
    status: (r.status as Status) ?? "New",
    seen: Boolean(r.seen),
    createdAt: new Date(r.created_at as string).toISOString(),
    token: (r.token as string) ?? "",
    source: (r.source as Source) ?? "enquiry",
    quote: r.quote == null ? null : Number(r.quote),
    paymentStatus: (r.payment_status as PaymentStatus) ?? "unpaid",
    paidAt: r.paid_at ? new Date(r.paid_at as string).toISOString() : null,
  };
}

/* ---------- pricing (bespoke calculator) ---------- */
export async function getPricing(): Promise<Pricing> {
  await ensureSchema();
  const rows = await sql`SELECT value FROM settings WHERE key = 'pricing'`;
  return rows.length === 0 ? DEFAULT_PRICING : (rows[0].value as Pricing);
}
export async function savePricing(p: Pricing): Promise<void> {
  await ensureSchema();
  const value = sql.json(p as unknown as Parameters<typeof sql.json>[0]);
  await sql`
    INSERT INTO settings (key, value) VALUES ('pricing', ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value}`;
}

/* ---------- standard products (instant checkout) ---------- */
export async function getProducts(): Promise<Product[]> {
  await ensureSchema();
  const rows = await sql`SELECT value FROM settings WHERE key = 'products'`;
  return rows.length === 0 ? DEFAULT_PRODUCTS : (rows[0].value as Product[]);
}
export async function saveProducts(p: Product[]): Promise<void> {
  await ensureSchema();
  const value = sql.json(p as unknown as Parameters<typeof sql.json>[0]);
  await sql`
    INSERT INTO settings (key, value) VALUES ('products', ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value}`;
}

/* ---------- orders ---------- */
export async function listEnquiries(): Promise<Enquiry[]> {
  await ensureSchema();
  const rows = await sql`
    SELECT * FROM enquiries
    ORDER BY (collection_date IS NULL), collection_date ASC, created_at DESC`;
  return rows.map(rowToEnquiry);
}

export async function getEnquiryByToken(token: string): Promise<Enquiry | null> {
  await ensureSchema();
  const rows = await sql`SELECT * FROM enquiries WHERE token = ${token} LIMIT 1`;
  return rows.length ? rowToEnquiry(rows[0]) : null;
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  await ensureSchema();
  const rows = await sql`SELECT * FROM enquiries WHERE id = ${id} LIMIT 1`;
  return rows.length ? rowToEnquiry(rows[0]) : null;
}

export async function createEnquiry(
  e: Omit<Enquiry, "seen" | "createdAt" | "token" | "quote" | "paymentStatus" | "paidAt" | "source"> &
    Partial<Pick<Enquiry, "source">>
): Promise<Enquiry> {
  await ensureSchema();
  const token = newToken();
  const rows = await sql`
    INSERT INTO enquiries
      (id, name, email, phone, size_id, size_name, flavour_id, flavour_name,
       estimate, date_needed, collection_date, details, status, token, source)
    VALUES
      (${e.id}, ${e.name}, ${e.email}, ${e.phone}, ${e.sizeId}, ${e.sizeName},
       ${e.flavourId}, ${e.flavourName}, ${e.estimate},
       ${e.dateNeeded || null}, ${e.collectionDate || null}, ${e.details}, ${e.status},
       ${token}, ${e.source ?? "enquiry"})
    RETURNING *`;
  return rowToEnquiry(rows[0]);
}

// Creates an already-paid order for a standard item bought via instant checkout.
export async function createPaidStandardOrder(p: {
  id: string; name: string; email: string | null; phone: string | null;
  itemName: string; amount: number; collectionDate: string | null; details: string | null;
  stripeSessionId: string; stripePaymentIntent: string | null;
}): Promise<Enquiry> {
  await ensureSchema();
  const token = newToken();
  const rows = await sql`
    INSERT INTO enquiries
      (id, name, email, phone, size_name, flavour_name, estimate, collection_date,
       details, status, token, source, quote, payment_status, paid_at,
       stripe_session_id, stripe_payment_intent)
    VALUES
      (${p.id}, ${p.name}, ${p.email}, ${p.phone}, ${p.itemName}, 'Standard item',
       ${p.amount}, ${p.collectionDate || null}, ${p.details}, 'Confirmed',
       ${token}, 'standard', ${p.amount}, 'paid', now(),
       ${p.stripeSessionId}, ${p.stripePaymentIntent})
    ON CONFLICT (id) DO NOTHING
    RETURNING *`;
  // If the webhook fires twice, the row already exists — fetch and return it.
  if (rows.length) return rowToEnquiry(rows[0]);
  const existing = await sql`SELECT * FROM enquiries WHERE id = ${p.id} LIMIT 1`;
  return rowToEnquiry(existing[0]);
}

export async function updateStatus(id: string, status: Status): Promise<void> {
  await ensureSchema();
  await sql`UPDATE enquiries SET status = ${status} WHERE id = ${id}`;
}

export async function setQuote(id: string, quote: number): Promise<void> {
  await ensureSchema();
  await sql`UPDATE enquiries SET quote = ${quote} WHERE id = ${id}`;
}

export async function markPaidBySession(
  sessionId: string, paymentIntent: string | null
): Promise<Enquiry | null> {
  await ensureSchema();
  const rows = await sql`
    UPDATE enquiries
    SET payment_status = 'paid', paid_at = now(), stripe_payment_intent = ${paymentIntent}
    WHERE stripe_session_id = ${sessionId}
    RETURNING *`;
  return rows.length ? rowToEnquiry(rows[0]) : null;
}

export async function attachSession(id: string, sessionId: string): Promise<void> {
  await ensureSchema();
  await sql`UPDATE enquiries SET stripe_session_id = ${sessionId} WHERE id = ${id}`;
}

export async function deleteEnquiry(id: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM enquiries WHERE id = ${id}`;
}

export async function markAllSeen(): Promise<void> {
  await ensureSchema();
  await sql`UPDATE enquiries SET seen = TRUE WHERE seen = FALSE`;
}
