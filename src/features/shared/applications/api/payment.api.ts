import { capFetch } from "@/src/lib/api/cap";
import type {
  PaymentInitiationResponse,
  PaymentQuote,
  PaymentReceipt,
} from "./types";

export async function getPaymentQuoteApi(id: string): Promise<PaymentQuote> {
  return capFetch<PaymentQuote>(`/applications/${id}/payment-quote`, {
    method: "GET",
  });
}

export async function initiateApplicationPaymentApi(
  id: string,
  payload?: { callbackUrl?: string },
): Promise<PaymentInitiationResponse> {
  return capFetch<PaymentInitiationResponse>(`/applications/${id}/pay`, {
    method: "POST",
    ...(payload?.callbackUrl ? { data: { callbackUrl: payload.callbackUrl } } : {}),
  });
}

export async function getApplicationReceiptApi(
  id: string,
): Promise<PaymentReceipt> {
  return capFetch<PaymentReceipt>(`/applications/${id}/receipt`, {
    method: "GET",
  });
}
