/**
 * features/auth/hooks/useResetPassword.ts
 *
 * TanStack Query mutation for POST /auth/reset-password.
 * On success: routes to /signin with a success toast.
 */

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { resetPasswordApi, type ResetPasswordPayload } from "@/features/auth/api/auth.api";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

export function useResetPassword() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPasswordApi(payload),

    onSuccess: () => {
      toast({
        type: "success",
        title: "Password Reset",
        description: "Your password has been updated. Please sign in.",
      });
      router.push("/signin");
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 422) {
          toast({
            type: "error",
            title: "Invalid Code",
            description: "The OTP code is incorrect or has expired.",
          });
        } else {
          toast({ type: "error", title: "Reset Failed", description: error.message });
        }
      } else {
        toast({ type: "error", title: "Network Error", description: "Unable to connect. Please try again." });
      }
    },
  });
}
