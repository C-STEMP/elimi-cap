/**
 * features/auth/hooks/useLogout.ts
 *
 * TanStack Query mutation for POST /auth/logout.
 * Clears tokens from storage and Redux store, then redirects to /signin.
 */

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as logoutAction } from "@/store/slices/authSlice";
import { clearTokens } from "@/lib/auth-storage";
import { logoutApi } from "@/features/auth/api/auth.api";
import { useToast } from "@/components/ui/toast";

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        try {
          await logoutApi({ refreshToken });
        } catch {
          // Silent catch — clear client storage regardless
        }
      }
    },

    onSettled: () => {
      clearTokens();
      dispatch(logoutAction());
      toast({
        type: "info",
        title: "Signed Out",
        description: "You have been signed out.",
      });
      router.push("/signin");
    },
  });
}
