// Shared, framework-agnostic constants and types.

export const BUSINESS_NAME = "Baked by Kenny";
export const CURRENCY = "£";

export const C = {
  peach: "#F5D6BD",
  peachDeep: "#EFC4A6",
  maroon: "#4A1A26",
  maroonDeep: "#36121C",
  cream: "#F7E4D4",
  ink: "#3a141e",
  accent: "#c97b5a",
};

export type Size = { id: string; name: string; serves: string; base: number };
export type Flavour = { id: string; name: string; add: number };
export type Pricing = { sizes: Size[]; flavours: Flavour[] };

export const DEFAULT_PRICING: Pricing = {
  sizes: [
    { id: "6in", name: '6" Round', serves: "8–10", base: 80 },
    { id: "8in", name: '8" Round', serves: "15–20", base: 100 },
    { id: "10in", name: '10" Round', serves: "25–30", base: 120 },
    { id: "tier", name: "Two-Tier", serves: "40+", base: 160 },
  ],
  flavours: [
    { id: "vanilla", name: "Vanilla Sponge", add: 0 },
    { id: "chocolate", name: "Chocolate Fudge", add:  10 },
    { id: "redvelvet", name: "Red Velvet", add: 10 },
    { id: "lemon", name: "Lemon Drizzle", add: 10 },
    { id: "carrot", name: "Carrot", add: 15 },
    { id: "biscoff", name: "Biscoff", add: 15 },
  ],
};

export const STATUSES = ["New", "Confirmed", "Baking", "Ready", "Collected"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  New: { bg: "rgba(201,123,90,0.22)", fg: "#7a3417" },
  Confirmed: { bg: "rgba(74,26,38,0.12)", fg: "#4A1A26" },
  Baking: { bg: "rgba(74,26,38,0.12)", fg: "#4A1A26" },
  Ready: { bg: "rgba(46,90,52,0.16)", fg: "#2f5a34" },
  Collected: { bg: "rgba(74,26,38,0.06)", fg: "#9a7d72" },
};

// Standard, fixed-price items customers can buy and pay for instantly.
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  allergens: string; // e.g. "Contains wheat, egg, milk"
  active: boolean;
};

export const DEFAULT_PRODUCTS: Product[] = [
  { id: "cupcakes6", name: "Box of 6 Cupcakes", description: "Vanilla or chocolate, buttercream topped.", price: 18, allergens: "Contains wheat, egg, milk", active: true },
  { id: "brownies", name: "Brownie Box (9)", description: "Rich fudge brownies.", price: 15, allergens: "Contains wheat, egg, milk, soya", active: true },
  { id: "cookies", name: "Cookie Dozen", description: "Classic chocolate chip.", price: 12, allergens: "Contains wheat, egg, milk", active: true },
];

export type PaymentStatus = "unpaid" | "paid";

export type GalleryPhoto = {
  id: string;
  url: string;
  caption: string | null;
  createdAt: string;
};

// "enquiry" = bespoke order placed via the form (priced after a call).
// "standard" = a fixed-price item bought instantly through checkout.
export type Source = "enquiry" | "standard";

export type Enquiry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  sizeId: string;
  sizeName: string;
  flavourId: string;
  flavourName: string;
  estimate: number;
  dateNeeded: string | null;
  collectionDate: string | null;
  details: string | null;
  status: Status;
  seen: boolean;
  createdAt: string;
  // payment / quoting
  token: string;             // unguessable id for the customer's order page
  source: Source;
  quote: number | null;      // final agreed price Kenny sets; null = not yet quoted
  paymentStatus: PaymentStatus;
  paidAt: string | null;
};
