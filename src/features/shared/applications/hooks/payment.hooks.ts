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

    onSuccess: (_data, id) => {
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
 * Opens the Paystack checkout in a pop-up and polls the application until the
 * backend reports it paid, then closes the pop-up. POST /pay takes no
 * callback URL, so Paystack's hosted page never redirects back by itself.
 * Falls back to a full-page redirect when the browser blocks the pop-up.
 */
export function usePaystackCheckout() {
  const initiatePayment = useInitiateApplicationPayment();
  const queryClient = useQueryClient();
  const [isAwaitingPayment, setIsAwaitingPayment] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsAwaitingPayment(false);
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

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
      // Open the window synchronously inside the click handler, before the
      // async /pay call, so pop-up blockers treat it as user-initiated.
      const width = 520;
      const height = 720;
      const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
      const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
      const popup = window.open(
        "",
        "elimi_paystack_checkout",
        `popup=yes,width=${width},height=${height},left=${left},top=${top}`,
      );
      if (popup) {
        try {
          popup.document.title = "Secure checkout";
          popup.document.body.innerHTML =
            '<p style="font-family:sans-serif;text-align:center;margin-top:40vh;color:#555">Loading secure checkout…</p>';
        } catch {}
      }

      initiatePayment.mutate(id, {
        onSuccess: (data) => {
          const checkoutUrl =
            data?.checkoutUrl ||
            (data as { data?: { checkoutUrl?: string } } | undefined)?.data?.checkoutUrl;

          if (!checkoutUrl) {
            popup?.close();
            refreshApplication(id);
            callbacks.onPaid();
            return;
          }

          if (!popup || popup.closed) {
            window.location.href = checkoutUrl;
            return;
          }

          popup.location.href = checkoutUrl;
          popup.focus();
          setIsAwaitingPayment(true);

          let checking = false;
          let closedChecks = 0;
          timerRef.current = setInterval(async () => {
            if (checking) return;
            checking = true;
            try {
              const paid = await isApplicationPaid(id);
              if (paid) {
                stopPolling();
                if (!popup.closed) popup.close();
                refreshApplication(id);
                callbacks.onPaid();
                return;
              }
              if (popup.closed && ++closedChecks >= CLOSED_GRACE_CHECKS) {
                stopPolling();
                refreshApplication(id);
                callbacks.onClosedUnpaid?.();
              }
            } finally {
              checking = false;
            }
          }, POLL_INTERVAL_MS);
        },
        onError: (error) => {
          popup?.close();
          callbacks.onError?.(error);
        },
      });
    },
    [initiatePayment, refreshApplication, stopPolling],
  );

  return {
    startCheckout,
    isPending: initiatePayment.isPending || isAwaitingPayment,
  };
}
