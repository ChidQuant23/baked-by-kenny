import { getEnquiryByToken } from "@/lib/db";
import { BUSINESS_NAME, CURRENCY, C } from "@/lib/constants";
import CakeMark from "../../components/CakeMark";
import PayButton from "./PayButton";

export const dynamic = "force-dynamic";

const fmt = (iso: string | null) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : null;

export default async function OrderPage({
  params, searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { token } = await params;
  const { paid } = await searchParams;
  const order = await getEnquiryByToken(token);

  const wrap: React.CSSProperties = {
    background: C.peach, minHeight: "100vh", color: C.maroon,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "48px 20px",
  };
  const card: React.CSSProperties = {
    background: "#fff", border: `1.5px solid ${C.peachDeep}`, borderRadius: 20,
    padding: "clamp(24px,5vw,40px)", maxWidth: 460, width: "100%",
  };
  const row = (label: string, val: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.peach}` }}>
      <span style={{ opacity: .7, fontSize: 17 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 17, textAlign: "right" }}>{val}</span>
    </div>
  );

  if (!order) {
    return (
      <div style={wrap}>
        <div style={{ ...card, textAlign: "center" }}>
          <CakeMark size={48} />
          <h1 className="bbk-display" style={{ fontSize: 26, margin: "12px 0 6px" }}>Order not found</h1>
          <p style={{ fontSize: 18, opacity: .8 }}>This link may be incorrect or out of date. Please check with {BUSINESS_NAME}.</p>
        </div>
      </div>
    );
  }

  const isPaid = order.paymentStatus === "paid";
  const hasQuote = order.quote != null;
  const cake = [order.sizeName, order.flavourName].filter((x) => x && x !== "Standard item").join(" · ");

  return (
    <div style={wrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <CakeMark size={36} />
        <span className="bbk-script" style={{ fontSize: 32 }}>{BUSINESS_NAME}</span>
      </div>

      <div style={card}>
        <h1 className="bbk-display" style={{ fontSize: 28, margin: "0 0 4px", fontWeight: 700 }}>
          {isPaid ? "Order paid" : hasQuote ? "Your order" : "Order received"}
        </h1>
        <p style={{ fontSize: 18, opacity: .8, margin: "0 0 20px" }}>Hi {order.name},</p>

        <div style={{ marginBottom: 20 }}>
          {cake && row("Cake", cake)}
          {order.collectionDate && row("Collection", fmt(order.collectionDate) || "")}
          {order.details && row("Details", order.details)}
          {hasQuote && row("Price", `${CURRENCY}${order.quote}`)}
        </div>

        {isPaid ? (
          <div style={{ background: "rgba(46,90,52,0.14)", color: "#2f5a34", borderRadius: 12, padding: "16px 18px", textAlign: "center", fontSize: 19, fontWeight: 600 }}>
            ✓ Paid — thank you! We'll have this ready for collection{order.collectionDate ? ` on ${fmt(order.collectionDate)}` : ""}.
          </div>
        ) : hasQuote ? (
          <>
            {paid === "1" && (
              <p style={{ background: C.peach, borderRadius: 10, padding: "10px 14px", fontSize: 16, margin: "0 0 14px" }}>
                Finishing up your payment… if you've just paid, this page will show “Paid” in a moment.
              </p>
            )}
            <PayButton token={order.token} amount={order.quote!} />
          </>
        ) : (
          <div style={{ background: C.peach, borderRadius: 12, padding: "16px 18px", textAlign: "center", fontSize: 18 }}>
            Thanks for your enquiry! Once we've talked through the details, your final price will appear here to pay.
          </div>
        )}
      </div>
    </div>
  );
}
