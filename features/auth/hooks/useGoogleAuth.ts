import { useGoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { saveTokens } from "@/lib/auth-storage";
import { googleAuthApi } from "@/features/auth/api/auth.api";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

export function useGoogleAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (idToken: string) => {
      return googleAuthApi({ idToken, intents: ["cap"] });
    },

    onSuccess: (data) => {
      saveTokens(data.accessToken, data.refreshToken);

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
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );

      toast({
        type: "success",
        title: data.isNewUser ? "Welcome!" : "Welcome Back!",
        description: `Signed in as ${data.user.email}`,
      });

      if (data.user.intents?.includes("cap")) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding/role-selection");
      }
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Google Sign-In Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to connect. Please try again.",
        });
      }
    },
  });

  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      const idToken = (tokenResponse as { id_token?: string }).id_token;
      if (idToken) {
        mutation.mutate(idToken);
      } else {
        toast({
          type: "error",
          title: "Google Sign-In Failed",
          description: "Unable to retrieve authentication token.",
        });
      }
    },
    onError: () => {
      toast({
        type: "error",
        title: "Google Sign-In Cancelled",
        description: "You cancelled the Google sign-in process.",
      });
    },
  });

  return {
    loginWithGoogle: () => login(),
    isPending: mutation.isPending,
  };
}
