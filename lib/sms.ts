import { CURRENCY, type Enquiry } from "./constants";

// Sends a text to the owner via Twilio. No-ops (with a log) if any of the
// Twilio env vars are missing, so the app keeps working without it.
export async function sendEnquirySms(e: Enquiry): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const to = process.env.OWNER_PHONE;

  if (!sid || !token || !from || !to) {
    console.warn("SMS not sent: Twilio env vars missing.");
    return;
  }

  const collection = e.collectionDate ? ` Collect ${e.collectionDate}.` : "";
  const contact = e.phone || e.email || "no contact given";
  // Keep it short — one SMS segment is ~160 characters.
  const body =
    `New cake enquiry from ${e.name}: ${e.sizeName}, ${e.flavourName} ` +
    `(${CURRENCY}${e.estimate}).${collection} Contact: ${contact}`;

  const params = new URLSearchParams({ To: to, From: from, Body: body });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );
    if (!res.ok) {
      console.error("Twilio error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Twilio request failed:", err);
  }
}

// Texts the owner when a payment lands.
export async function sendPaymentSms(e: Enquiry): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const to = process.env.OWNER_PHONE;
  if (!sid || !token || !from || !to) return;

  const amount = e.quote ?? e.estimate;
  const collection = e.collectionDate ? ` Collect ${e.collectionDate}.` : "";
  const body = `Payment received: ${CURRENCY}${amount} from ${e.name} for ${e.sizeName}.${collection}`;
  const params = new URLSearchParams({ To: to, From: from, Body: body });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );
    if (!res.ok) console.error("Twilio error:", res.status, await res.text());
  } catch (err) {
    console.error("Twilio request failed:", err);
  }
}
