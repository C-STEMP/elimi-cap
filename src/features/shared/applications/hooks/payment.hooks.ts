import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  initiateApplicationPaymentApi,
  getPaymentQuoteApi,
  getApplicationReceiptApi,
} from "../api";
import { APPLICATION_QUERY_KEYS } from "./queryKeys";

export function useInitiateApplicationPayment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => {
      try {
        if (id && typeof window !== "undefined") {
          sessionStorage.setItem("pending_payment_application_id", id);
          localStorage.setItem("pending_payment_application_id", id);
        }
      } catch {}
      return initiateApplicationPaymentApi(id);
    },

    onSuccess: (data, id) => {
      try {
        if (id && typeof window !== "undefined") {
          sessionStorage.setItem("pending_payment_application_id", id);
          localStorage.setItem("pending_payment_application_id", id);
        }
      } catch {}

      if (data?.checkoutUrl) {
        toast({
          type: "success",
          title: "Redirecting to Paystack",
          description: "Redirecting to secure payment checkout...",
        });
        window.location.href = data.checkoutUrl;
      }
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Payment Initiation Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to initiate payment. Please try again.",
        });
      }
    },
  });
}

export function useGetPaymentQuote(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["applications", "payment-quote", id],
    queryFn: () => getPaymentQuoteApi(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useGetApplicationReceipt(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.receipt(id),
    queryFn: () => getApplicationReceiptApi(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}
