import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  initiateApplicationPaymentApi,
  getPaymentQuoteApi,
  getApplicationReceiptApi,
  getApplicationByIdApi,
  getApplicationStagesApi,
} from "../api";
import { APPLICATION_QUERY_KEYS } from "./queryKeys";

function buildPaymentCallbackUrl(applicationId: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const pathname = window.location.pathname || `/applications/${applicationId}`;
  return `${window.location.origin}${pathname}?payment=success`;
}

export function useInitiateApplicationPayment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: string | { id: string; callbackUrl?: string }) => {
      const id = typeof input === "string" ? input : input.id;
      const callbackUrl =
        (typeof input === "string" ? undefined : input.callbackUrl) ||
        buildPaymentCallbackUrl(id);
      try {
        if (id && typeof window !== "undefined") {
          sessionStorage.setItem("pending_payment_application_id", id);
          localStorage.setItem("pending_payment_application_id", id);
        }
      } catch {}
      return initiateApplicationPaymentApi(id, { callbackUrl });
    },

    onSuccess: (_data, input) => {
      const id = typeof input === "string" ? input : input.id;
      try {
        if (id && typeof window !== "undefined") {
          sessionStorage.setItem("pending_payment_application_id", id);
          localStorage.setItem("pending_payment_application_id", id);
        }
      } catch {}
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

const POLL_INTERVAL_MS = 3000;
// After the pop-up closes, keep checking briefly: the backend confirms payment
// via an async payment.completed webhook, which can land a few seconds late.
const CLOSED_GRACE_CHECKS = 3;

async function isApplicationPaid(id: string): Promise<boolean> {
  const [app, stages] = await Promise.all([
    getApplicationByIdApi(id).catch(() => null),
    getApplicationStagesApi(id).catch(() => []),
  ]);
  if ((app as { paymentCompleted?: boolean } | null)?.paymentCompleted) return true;
  const paymentStage = stages.find(
    (s) => s.stageKey === "payment" || s.stageKey === "payment_quote",
  );
  const status = paymentStage?.status as string | undefined;
  return status === "successful" || status === "completed";
}

interface PaystackCheckoutCallbacks {
  /** Payment confirmed by the backend; the pop-up has been closed. */
  onPaid: () => void;
  /** The candidate closed the pop-up without a confirmed payment. */
  onClosedUnpaid?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Initiates Paystack checkout with a callbackUrl pointing back to the current
 * application page (?payment=success), then navigates to Paystack's hosted
 * checkout so users are automatically redirected back on completion across all
 * browsers and mobile devices without pop-up blockers.
 */
export function usePaystackCheckout() {
  const initiatePayment = useInitiateApplicationPayment();
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const refreshApplication = useCallback(
    (id: string) => {
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.stages(id) });
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.receipt(id) });
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });
    },
    [queryClient],
  );

  const startCheckout = useCallback(
    (id: string, callbacks: PaystackCheckoutCallbacks) => {
      const callbackUrl = buildPaymentCallbackUrl(id);
      setIsRedirecting(true);

      initiatePayment.mutate(
        { id, callbackUrl },
        {
          onSuccess: (data) => {
            const checkoutUrl =
              data?.checkoutUrl ||
              (data as { data?: { checkoutUrl?: string } } | undefined)?.data?.checkoutUrl;

            if (!checkoutUrl) {
              setIsRedirecting(false);
              refreshApplication(id);
              callbacks.onPaid();
              return;
            }

            window.location.href = checkoutUrl;
          },
          onError: (error) => {
            setIsRedirecting(false);
            callbacks.onError?.(error);
          },
        },
      );
    },
    [initiatePayment, refreshApplication],
  );

  return {
    startCheckout,
    isPending: initiatePayment.isPending || isRedirecting,
  };
}
