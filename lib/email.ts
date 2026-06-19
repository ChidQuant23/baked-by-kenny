import { Resend } from "resend";
import { BUSINESS_NAME, CURRENCY, type Enquiry } from "./constants";

export async function sendEnquiryAlert(e: Enquiry): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  const from = process.env.EMAIL_FROM || "Baked by Kenny <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.warn("Email not sent: RESEND_API_KEY or OWNER_EMAIL missing.");
    return;
  }

  const resend = new Resend(apiKey);
  const line = (label: string, val: string | number | null) =>
    val ? `<tr><td style="padding:4px 12px 4px 0;color:#9a7d72">${label}</td><td style="padding:4px 0;color:#3a141e"><strong>${val}</strong></td></tr>` : "";

  const html = `
    <div style="font-family:Georgia,serif;max-width:520px;margin:auto;background:#F5D6BD;padding:28px;border-radius:16px">
      <h1 style="color:#4A1A26;margin:0 0 4px;font-size:24px">New cake enquiry</h1>
      <p style="color:#4A1A26;opacity:.8;margin:0 0 18px">Someone just enquired through your website.</p>
      <table style="border-collapse:collapse;font-size:15px">
        ${line("Name", e.name)}
        ${line("Email", e.email)}
        ${line("Phone", e.phone)}
        ${line("Cake", `${e.sizeName} · ${e.flavourName}`)}
        ${line("Estimate", `${CURRENCY}${e.estimate}`)}
        ${line("Collection", e.collectionDate)}
        ${line("Date needed", e.dateNeeded)}
        ${line("Details", e.details)}
      </table>
      <p style="margin:20px 0 0">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/owner"
           style="background:#4A1A26;color:#F7E4D4;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:15px">
           Open dashboard</a>
      </p>
    </div>`;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `New cake enquiry from ${e.name}`,
      html,
    });
  } catch (err) {
    console.error("Resend error:", err);
  }
}

function resendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Baked by Kenny <onboarding@resend.dev>";
  if (!apiKey) return null;
  return { resend: new Resend(apiKey), from };
}

// Sent to the CUSTOMER once Kenny has agreed a price, with their pay link.
export async function sendQuoteReadyEmail(e: Enquiry, payUrl: string): Promise<void> {
  const c = resendClient();
  if (!c || !e.email) {
    console.warn("Quote email not sent: Resend not configured or no customer email.");
    return;
  }
  const html = `
    <div style="font-family:Georgia,serif;max-width:520px;margin:auto;background:#F5D6BD;padding:28px;border-radius:16px">
      <h1 style="color:#4A1A26;margin:0 0 6px;font-size:24px">Your cake is confirmed</h1>
      <p style="color:#4A1A26;opacity:.85;margin:0 0 16px">
        Hi ${e.name}, thanks for chatting with us. Here's your order — you can pay the agreed price below.
      </p>
      <table style="border-collapse:collapse;font-size:15px;margin-bottom:18px">
        <tr><td style="padding:4px 12px 4px 0;color:#9a7d72">Cake</td><td style="padding:4px 0;color:#3a141e"><strong>${e.sizeName}${e.flavourName ? " · " + e.flavourName : ""}</strong></td></tr>
        ${e.collectionDate ? `<tr><td style="padding:4px 12px 4px 0;color:#9a7d72">Collection</td><td style="padding:4px 0;color:#3a141e"><strong>${e.collectionDate}</strong></td></tr>` : ""}
        <tr><td style="padding:4px 12px 4px 0;color:#9a7d72">Price</td><td style="padding:4px 0;color:#3a141e"><strong>${CURRENCY}${e.quote}</strong></td></tr>
      </table>
      <p style="margin:0">
        <a href="${payUrl}" style="background:#4A1A26;color:#F7E4D4;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:16px">
          Pay ${CURRENCY}${e.quote}</a>
      </p>
    </div>`;
  try {
    await c.resend.emails.send({
      from: c.from, to: e.email,
      subject: `${BUSINESS_NAME} — your cake is confirmed (${CURRENCY}${e.quote})`,
      html,
    });
  } catch (err) {
    console.error("Resend error:", err);
  }
}

// Sent to the OWNER when a payment lands (bespoke order or standard item).
export async function sendPaymentReceivedEmail(e: Enquiry): Promise<void> {
  const c = resendClient();
  const to = process.env.OWNER_EMAIL;
  if (!c || !to) {
    console.warn("Payment email not sent: Resend or OWNER_EMAIL missing.");
    return;
  }
  const amount = e.quote ?? e.estimate;
  const html = `
    <div style="font-family:Georgia,serif;max-width:520px;margin:auto;background:#F5D6BD;padding:28px;border-radius:16px">
      <h1 style="color:#2f5a34;margin:0 0 6px;font-size:24px">Payment received — ${CURRENCY}${amount}</h1>
      <p style="color:#4A1A26;opacity:.85;margin:0 0 14px">
        ${e.name} has paid for ${e.sizeName}${e.flavourName && e.flavourName !== "Standard item" ? " · " + e.flavourName : ""}.
      </p>
      <table style="border-collapse:collapse;font-size:15px">
        ${e.email ? `<tr><td style="padding:4px 12px 4px 0;color:#9a7d72">Email</td><td style="padding:4px 0;color:#3a141e"><strong>${e.email}</strong></td></tr>` : ""}
        ${e.phone ? `<tr><td style="padding:4px 12px 4px 0;color:#9a7d72">Phone</td><td style="padding:4px 0;color:#3a141e"><strong>${e.phone}</strong></td></tr>` : ""}
        ${e.collectionDate ? `<tr><td style="padding:4px 12px 4px 0;color:#9a7d72">Collection</td><td style="padding:4px 0;color:#3a141e"><strong>${e.collectionDate}</strong></td></tr>` : ""}
        ${e.details ? `<tr><td style="padding:4px 12px 4px 0;color:#9a7d72">Notes</td><td style="padding:4px 0;color:#3a141e">${e.details}</td></tr>` : ""}
      </table>
      <p style="margin:18px 0 0">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/owner"
           style="background:#4A1A26;color:#F7E4D4;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:15px">Open dashboard</a>
      </p>
    </div>`;
  try {
    await c.resend.emails.send({
      from: c.from, to,
      subject: `Payment received from ${e.name} — ${CURRENCY}${amount}`,
      html,
    });
  } catch (err) {
    console.error("Resend error:", err);
  }
}
