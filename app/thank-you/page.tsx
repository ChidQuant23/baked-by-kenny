import Link from "next/link";
import { BUSINESS_NAME, C } from "@/lib/constants";
import CakeMark from "../components/CakeMark";

export default function ThankYou() {
  return (
    <div style={{
      background: C.peach, minHeight: "100vh", color: C.maroon,
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, textAlign: "center",
    }}>
      <CakeMark size={56} />
      <h1 className="bbk-display" style={{ fontSize: 34, margin: "16px 0 8px", fontWeight: 700 }}>Thank you!</h1>
      <p style={{ fontSize: 20, opacity: .85, maxWidth: 420, margin: "0 0 24px" }}>
        Your order and payment are confirmed. {BUSINESS_NAME} has been notified and will be in touch about collection.
      </p>
      <Link href="/" style={{ background: C.maroon, color: C.cream, padding: "12px 24px", borderRadius: 999, fontSize: 18, textDecoration: "none", fontWeight: 600 }}>
        Back to home
      </Link>
    </div>
  );
}
