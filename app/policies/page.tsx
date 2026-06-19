import Link from "next/link";
import { BUSINESS_NAME, C } from "@/lib/constants";
import CakeMark from "../components/CakeMark";

export const metadata = { title: `Policies & Allergens — ${BUSINESS_NAME}` };

// NOTE FOR THE OWNER: this is a starting template, not legal advice.
// Replace every [bracketed] placeholder with your real details, and have the
// cancellation/refund wording checked before relying on it.

const sectionTitle: React.CSSProperties = {
  fontSize: "clamp(22px,4vw,28px)", fontWeight: 700, margin: "30px 0 8px",
};
const para: React.CSSProperties = { fontSize: 18, lineHeight: 1.55, opacity: .9, margin: "0 0 10px" };

export default function Policies() {
  return (
    <div style={{ background: C.peach, minHeight: "100vh", color: C.maroon, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px clamp(16px,5vw,56px)", maxWidth: 820, margin: "0 auto" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: C.maroon }}>
          <CakeMark size={34} />
          <span className="bbk-script" style={{ fontSize: 30 }}>{BUSINESS_NAME}</span>
        </Link>
        <Link href="/" style={{ color: C.maroon, fontSize: 17, textDecoration: "none", fontWeight: 600 }}>← Home</Link>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px clamp(16px,5vw,56px) 70px" }}>
        <h1 className="bbk-display" style={{ fontSize: "clamp(34px,7vw,52px)", fontWeight: 700, margin: "10px 0 4px" }}>
          Policies &amp; Allergens
        </h1>
        <p style={{ fontSize: 16, opacity: .6, margin: "0 0 8px" }}>Last updated [date]</p>

        <h2 className="bbk-display" style={sectionTitle}>Allergens</h2>
        <p style={para}>
          All our cakes are made in a home kitchen that also handles the following
          allergens, so we cannot guarantee any product is completely free from
          traces of them: cereals containing gluten (wheat, rye, barley, oats),
          eggs, milk, peanuts, tree nuts, soya, sesame, and sulphites. [Edit this
          list to match your kitchen.]
        </p>
        <p style={para}>
          If you or anyone the cake is for has a food allergy or intolerance,
          please tell us <strong>before you order</strong> and we'll confirm
          exactly what's in your cake. Full ingredient and allergen information
          for any item is available on request — just ask when you enquire or
          call.
        </p>
        <p style={para}>
          The 14 allergens we declare are: celery, cereals containing gluten,
          crustaceans, eggs, fish, lupin, milk, molluscs, mustard, tree nuts,
          peanuts, sesame, soya, and sulphur dioxide / sulphites.
        </p>

        <h2 className="bbk-display" style={sectionTitle}>Ordering &amp; payment</h2>
        <p style={para}>
          Custom cakes start with an enquiry through this site. We'll then talk
          through the details with you — usually by phone — and agree a final
          price. Once that's agreed, you'll receive a secure link to view your
          order and pay in full by card. Payment is taken in full before
          collection. Standard items in the shop can be bought and paid for
          straight away.
        </p>
        <p style={para}>
          Please place custom orders at least [X days/weeks] in advance. We'll
          always do our best with shorter notice but can't guarantee
          availability.
        </p>

        <h2 className="bbk-display" style={sectionTitle}>Collection</h2>
        <p style={para}>
          Orders are for collection from [your area/postcode] on the agreed date
          and time. [Add delivery details here if you offer it, including any
          delivery charge and area.] Please check your cake on collection — once
          it leaves us we can't take responsibility for any damage in transit or
          storage.
        </p>

        <h2 className="bbk-display" style={sectionTitle}>Cancellations &amp; refunds</h2>
        <p style={para}>
          Because every custom cake is freshly made to order and perishable, it
          is exempt from the usual 14-day right to cancel that applies to
          distance sales. The following applies instead:
        </p>
        <p style={para}>
          Cancellations made [X or more days] before the collection date will be
          refunded in full. Cancellations within [X days] of collection are
          [non-refundable / refundable minus a deposit of £X], as ingredients
          and preparation will already be underway. If we ever have to cancel,
          you'll receive a full refund. [Review and adjust these terms to suit
          your business.]
        </p>

        <h2 className="bbk-display" style={sectionTitle}>Your privacy</h2>
        <p style={para}>
          When you enquire or order, we collect your name, contact details and
          order information so we can prepare your cake and stay in touch about
          it. Card payments are processed securely by Stripe — we never see or
          store your card details. We don't share your information with anyone
          else or use it for marketing without your consent, and we keep it only
          as long as needed for our records. To ask what we hold or to have your
          details removed, contact us using the details below.
        </p>

        <h2 className="bbk-display" style={sectionTitle}>Contact</h2>
        <p style={para}>
          {BUSINESS_NAME} · [email address] · [phone number] · [town, county]
        </p>
      </main>

      <footer style={{ maxWidth: 720, margin: "0 auto", padding: "24px clamp(16px,5vw,56px) 40px", borderTop: `1px solid ${C.peachDeep}`, textAlign: "center" }}>
        <Link href="/" style={{ color: C.maroon, opacity: .7, fontSize: 16, textDecoration: "none" }}>← Back to {BUSINESS_NAME}</Link>
      </footer>
    </div>
  );
}
