import type { Enquiry } from "./constants";
import { sendEnquiryAlert, sendPaymentReceivedEmail } from "./email";
import { sendEnquirySms, sendPaymentSms } from "./sms";

// New enquiry → alert the owner on every configured channel.
export async function notifyOwner(e: Enquiry): Promise<void> {
  await Promise.allSettled([sendEnquiryAlert(e), sendEnquirySms(e)]);
}

// Payment landed → alert the owner on every configured channel.
export async function notifyPaymentReceived(e: Enquiry): Promise<void> {
  await Promise.allSettled([sendPaymentReceivedEmail(e), sendPaymentSms(e)]);
}
