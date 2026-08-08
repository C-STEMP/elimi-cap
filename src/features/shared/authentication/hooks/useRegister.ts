/**
 * features/auth/hooks/useRegister.ts
 *
 * TanStack Query mutation for POST /auth/register.
 * On success — stores email in Redux session so the OTP page can read it.
 */

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  registerApi,
  type RegisterPayload,
} from "@/src/features/shared/authentication/api/auth.api";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";

export function useRegister() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerApi(payload),

    onSuccess: (_data, variables) => {
      toast({
        type: "info",
        title: "Check Your Email",
        description:
          "We've sent a 4-digit verification code to your email address.",
      });
      router.push(`/verify?email=${encodeURIComponent(variables.email)}`);
    },

    onError: (error: Error, variables) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 409) {
          toast({
            type: "error",
            title: "Email Already Registered",
            description:
              "This email is already in use. Try signing in instead.",
          });
        } else if (error.statusCode === 422) {
          toast({
            type: "error",
            title: "Validation Error",
            description: error.message,
          });
        } else {
          toast({
            type: "error",
            title: "Registration Failed",
            description: error.message,
          });
        }
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to connect. Please try again.",
        });
      }
    },
  });
}
