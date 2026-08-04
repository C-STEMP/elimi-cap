/**
 * features/auth/hooks/useForgotPassword.ts
 *
 * TanStack Query mutation for POST /auth/forgot-password.
 * NOTE: Always returns 200 regardless of whether email exists (anti-enumeration).
 * Do NOT branch UI logic on "found" vs "not found".
 */

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { forgotPasswordApi, type ForgotPasswordPayload } from "@/features/auth/api/auth.api";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

export function useForgotPassword() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPasswordApi(payload),

    onSuccess: (_data, variables) => {
      toast({
        type: "success",
        title: "Reset Code Sent",
        description: "If this email is registered, you will receive a reset code shortly.",
      });
      router.push(
        `/change-password?email=${encodeURIComponent(variables.email)}&mode=reset`
      );
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({ type: "error", title: "Request Failed", description: error.message });
      } else {
        toast({ type: "error", title: "Network Error", description: "Unable to connect. Please try again." });
      }
    },
  });
}
