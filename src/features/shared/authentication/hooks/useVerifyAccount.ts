/**
 * features/auth/hooks/useVerifyAccount.ts
 *
 * TanStack Query mutation for POST /auth/verify-account.
 * This is the actual login moment for new accounts.
 * On success: persists session, routes to onboarding.
 */

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { saveTokens } from "@/src/lib/auth-storage";
import {
  verifyAccountApi,
  type VerifyAccountPayload,
} from "@/src/features/shared/authentication/api/auth.api";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";

export function useVerifyAccount() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: VerifyAccountPayload) => verifyAccountApi(payload),

    onSuccess: (data) => {
      // Persist tokens
      saveTokens(data.accessToken, data.refreshToken);

      // Hydrate Redux → redux-persist handles storage
      dispatch(
        setCredentials({
          user: {
            userId: data.user.userId,
            email: data.user.email,
            status: data.user.status,
            intents: data.user.intents,
            createdAt: data.user.createdAt,
            isVerified: true,
          },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );

      toast({
        type: "success",
        title: "Email Verified!",
        description: "Your account has been created successfully.",
      });

      router.push("/onboarding/welcome");
    },

    onError: (error: Error) => {
      if (error instanceof ApiError && error.statusCode === 422) {
        toast({
          type: "error",
          title: "Invalid Code",
          description:
            "The code is incorrect or has expired. Please try again.",
        });
      } else {
        toast({
          type: "error",
          title: "Verification Failed",
          description: (error as Error).message,
        });
      }
    },
  });
}
