/**
 * features/auth/hooks/useResendOtp.ts
 *
 * TanStack Query mutation for POST /auth/otp/resend.
 */

import { useMutation } from "@tanstack/react-query";
import { resendOtpApi, type ResendOtpPayload } from "@/features/auth/api/auth.api";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

export function useResendOtp() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: ResendOtpPayload) => resendOtpApi(payload),

    onSuccess: () => {
      toast({
        type: "success",
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError && error.statusCode === 429) {
        toast({
          type: "error",
          title: "Too Many Requests",
          description: "Please wait before requesting another code.",
        });
      } else {
        toast({ type: "error", title: "Resend Failed", description: "Could not resend the code. Please try again." });
      }
    },
  });
}
