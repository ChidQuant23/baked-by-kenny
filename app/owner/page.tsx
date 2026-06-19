import { listEnquiries, getPricing, getProducts } from "@/lib/db";
import { DEFAULT_PRICING, DEFAULT_PRODUCTS, type Enquiry, type Product } from "@/lib/constants";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default async function OwnerPage() {
  let enquiries: Enquiry[] = [];
  let pricing = DEFAULT_PRICING;
  let products: Product[] = DEFAULT_PRODUCTS;
  try {
    [enquiries, pricing, products] = await Promise.all([listEnquiries(), getPricing(), getProducts()]);
  } catch {
    // render an empty dashboard if the DB isn't reachable
  }
  return <Dashboard initialEnquiries={enquiries} initialPricing={pricing} initialProducts={products} />;
}
