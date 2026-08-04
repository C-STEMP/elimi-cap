/**
 * features/auth/hooks/useLogin.ts
 *
 * TanStack Query mutation for POST /auth/login.
 * On success:
 *  - Saves tokens to localStorage via auth-storage
 *  - Dispatches setCredentials to Redux (triggers redux-persist → survives reload)
 *  - Routes to dashboard based on user intents
 */

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { saveTokens } from "@/lib/auth-storage";
import { loginApi, type LoginPayload } from "@/features/auth/api/auth.api";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginApi(payload),

    onSuccess: (data) => {
      // 1. Persist raw tokens to localStorage (for API client bearer injection)
      saveTokens(data.accessToken, data.refreshToken);

      // 2. Hydrate Redux store (redux-persist will write this to localStorage too)
      dispatch(
        setCredentials({
          user: {
            userId: data.user.userId,
            email: data.user.email,
            status: data.user.status,
            intents: data.user.intents,
            createdAt: data.user.createdAt,
            isVerified: data.user.status === "active",
          },
          token: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );

      toast({
        type: "success",
        title: "Welcome Back!",
        description: `Signed in as ${data.user.email}`,
      });

      // 3. Route based on user's intent
      if (data.user.intents?.includes("cap")) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding/role-selection");
      }
    },

    onError: (error: Error, variables) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 401) {
          toast({
            type: "error",
            title: "Sign In Failed",
            description: "Invalid email or password. Please try again.",
          });
        } else if (error.statusCode === 403) {
          toast({
            type: "error",
            title: "Account Not Verified",
            description: "Please verify your email first.",
          });
          router.push(`/verify?email=${encodeURIComponent(variables.email)}`);
        } else {
          toast({ type: "error", title: "Sign In Failed", description: error.message });
        }
      } else {
        toast({ type: "error", title: "Network Error", description: "Unable to connect. Please try again." });
      }
    },
  });
}
