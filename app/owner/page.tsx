import { listEnquiries, getPricing, getProducts, listPhotos } from "@/lib/db";
import { DEFAULT_PRICING, DEFAULT_PRODUCTS, type Enquiry, type Product, type GalleryPhoto } from "@/lib/constants";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default async function OwnerPage() {
  let enquiries: Enquiry[] = [];
  let pricing = DEFAULT_PRICING;
  let products: Product[] = DEFAULT_PRODUCTS;
  let photos: GalleryPhoto[] = [];
  try {
    [enquiries, pricing, products, photos] = await Promise.all([
      listEnquiries(), getPricing(), getProducts(), listPhotos(),
    ]);
  } catch {
    // render an empty dashboard if the DB isn't reachable
  }
  return <Dashboard initialEnquiries={enquiries} initialPricing={pricing} initialProducts={products} initialPhotos={photos} />;
}