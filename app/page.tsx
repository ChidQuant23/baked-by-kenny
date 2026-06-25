import { getPricing, getProducts, countPhotos } from "@/lib/db";
import { DEFAULT_PRICING, DEFAULT_PRODUCTS } from "@/lib/constants";
import PublicSite from "./PublicSite";

export const dynamic = "force-dynamic";

export default async function Home() {
  let pricing = DEFAULT_PRICING;
  let products = DEFAULT_PRODUCTS;
  let galleryCount = 0;
  try {
    [pricing, products, galleryCount] = await Promise.all([getPricing(), getProducts(), countPhotos()]);
  } catch {
    // fall back to defaults if the DB isn't reachable yet
  }
  return <PublicSite pricing={pricing} products={products.filter((p) => p.active)} hasGallery={galleryCount > 0} />;
}