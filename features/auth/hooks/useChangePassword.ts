/**
 * features/auth/hooks/useChangePassword.ts
 *
 * TanStack Query mutation for PATCH /auth/change-password (authenticated).
 */

import { useMutation } from "@tanstack/react-query";
import { changePasswordApi, type ChangePasswordPayload } from "@/features/auth/api/auth.api";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

export function useChangePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePasswordApi(payload),

    onSuccess: () => {
      toast({
        type: "success",
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 401) {
          toast({
            type: "error",
            title: "Incorrect Password",
            description: "Your current password is incorrect.",
          });
        } else {
          toast({ type: "error", title: "Update Failed", description: error.message });
        }
      } else {
        toast({ type: "error", title: "Network Error", description: "Unable to connect. Please try again." });
      }
    },
  });
}
