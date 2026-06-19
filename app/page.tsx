import { getPricing, getProducts } from "@/lib/db";
import { DEFAULT_PRICING, DEFAULT_PRODUCTS } from "@/lib/constants";
import PublicSite from "./PublicSite";

export const dynamic = "force-dynamic";

export default async function Home() {
  let pricing = DEFAULT_PRICING;
  let products = DEFAULT_PRODUCTS;
  try {
    [pricing, products] = await Promise.all([getPricing(), getProducts()]);
  } catch {
    // fall back to defaults if the DB isn't reachable yet
  }
  return <PublicSite pricing={pricing} products={products.filter((p) => p.active)} />;
}
