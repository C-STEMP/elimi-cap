import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { CredentialResponse } from "@react-oauth/google";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCredentials,
  setRole,
  setCentreId,
  setCentreRole,
  markVerified,
  logout as logoutAction,
} from "@/store/slices/authSlice";
import {
  saveTokens,
  clearTokens,
  saveOnboardedStatus,
  savePersona,
  saveCentreId,
  saveCentreRole,
  saveUser,
  resolveUserDestination,
} from "@/src/lib/auth-storage";
import {
  getOnboardingMineApi,
  parseOnboardingMine,
  getCandidateProfileApi,
} from "@/src/features/shared/onboarding/api";
import { getMeApi } from "@/src/features/shared/account/api";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  registerApi,
  type RegisterPayload,
  verifyAccountApi,
  type VerifyAccountPayload,
  resendOtpApi,
  type ResendOtpPayload,
  loginApi,
  type LoginPayload,
  forgotPasswordApi,
  type ForgotPasswordPayload,
  resetPasswordApi,
  type ResetPasswordPayload,
  changePasswordApi,
  type ChangePasswordPayload,
  logoutApi,
  googleAuthApi,
} from "@/src/features/shared/authentication/api/auth.api";

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

    onError: (error: Error) => {
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

export function useVerifyAccount() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: VerifyAccountPayload) => verifyAccountApi(payload),

    onSuccess: (data) => {
      saveTokens(data.accessToken, data.refreshToken);
      saveOnboardedStatus(false);
      savePersona("");
      saveUser({
        userId: data.user.userId || data.user.id || "",
        email: data.user.email,
        status: data.user.status,
        intents: data.user.intents || [],
        createdAt: data.user.createdAt || new Date().toISOString(),
      });

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
        toast({
          type: "error",
          title: "Resend Failed",
          description: "Could not resend the code. Please try again.",
        });
      }
    },
  });
}

export function useLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginApi(payload),

    onSuccess: async (data, variables) => {
      saveTokens(data.accessToken, data.refreshToken);
      saveUser({
        userId: data.user.userId || data.user.id || "",
        email: data.user.email || variables.email,
        status: data.user.status,
        intents: data.user.intents || [],
        createdAt: data.user.createdAt || new Date().toISOString(),
      });

      dispatch(
        setCredentials({
          user: {
            userId: data.user.userId || data.user.id || "",
            email: data.user.email || variables.email,
            status: data.user.status,
            intents: data.user.intents,
            createdAt: data.user.createdAt,
            isVerified: data.user.status === "active",
          },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );

      toast({
        type: "success",
        title: "Welcome Back!",
        description: `Signed in as ${data.user.email || variables.email}`,
      });

      try {
        const [res, profile, meRes] = await Promise.allSettled([
          getOnboardingMineApi(),
          getCandidateProfileApi(),
          getMeApi(),
        ]);

        if (profile.status === "fulfilled" && profile.value?.identityVerified) {
          dispatch(markVerified());
        }

        if (meRes.status === "fulfilled") {
          if (meRes.value.identityVerified) {
            dispatch(markVerified());
          }
          if (meRes.value.centres && meRes.value.centres.length > 0) {
            const activeCentre = meRes.value.centres[0];
            const role = activeCentre.role || "super_admin";
            saveCentreId(activeCentre.centreId);
            saveCentreRole(role);
            dispatch(setCentreId(activeCentre.centreId));
            dispatch(setCentreRole(role));
          }
        }

        const userEmail = data.user.email || variables.email;

        if (res.status === "fulfilled") {
          const { isOnboarded, persona } = parseOnboardingMine(res.value);

          if (persona) {
            savePersona(persona);
            if (persona === "centre") {
              const centreRole =
                meRes.status === "fulfilled" && meRes.value.centres?.[0]?.role
                  ? meRes.value.centres[0].role
                  : "super_admin";
              dispatch(setRole(centreRole));
              saveCentreRole(centreRole);
            } else {
              dispatch(setRole(persona));
            }
          }

          saveOnboardedStatus(isOnboarded);
          const destination = resolveUserDestination(
            isOnboarded,
            persona,
            userEmail,
          );
          router.push(destination);
        } else {
          saveOnboardedStatus(false);
          const destination = resolveUserDestination(false, null, userEmail);
          router.push(destination);
        }
      } catch {
        saveOnboardedStatus(false);
        router.push("/onboarding/role-selection");
      }
    },

    onError: (error: Error, variables) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 401) {
          const code = (error.code || "").toUpperCase();
          const msg = (error.message || "").toLowerCase();
          const isUnregistered =
            code.includes("NOT_FOUND") ||
            code.includes("NOT_REGISTERED") ||
            code.includes("NO_USER") ||
            msg.includes("not found") ||
            msg.includes("not registered") ||
            msg.includes("no account") ||
            msg.includes("does not exist") ||
            msg.includes("doesn't exist");

          if (isUnregistered) {
            toast({
              type: "error",
              title: "Account Not Found",
              description:
                "This email is not registered. Please sign up to create an account.",
            });
          } else {
            toast({
              type: "error",
              title: "Sign In Failed",
              description: "Invalid email or password. Please try again.",
            });
          }
        } else if (
          error.statusCode === 403 ||
          error.code === "user.unverified" ||
          (error.message || "").toLowerCase().includes("not verified")
        ) {
          try {
            resendOtpApi({
              email: variables.email,
              purpose: "account_verify",
            });
          } catch {
            // Ignore error if auto-resend encounters rate-limit
          }
          toast({
            type: "info",
            title: "Verification Code Sent",
            description:
              "We sent a verification code to your email. Please verify your account to continue.",
          });
          router.push(`/verify?email=${encodeURIComponent(variables.email)}`);
        } else {
          toast({
            type: "error",
            title: "Sign In Failed",
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

export function useForgotPassword() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPasswordApi(payload),

    onSuccess: (_data, variables) => {
      toast({
        type: "success",
        title: "Reset Code Sent",
        description:
          "If this email is registered, you will receive a reset code shortly.",
      });
      router.push(
        `/verify?email=${encodeURIComponent(variables.email)}&purpose=password_reset`,
      );
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Request Failed",
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
}

export function useResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPasswordApi(payload),

    onSuccess: () => {
      toast({
        type: "success",
        title: "Password Reset",
        description: "Your password has been updated. Please sign in.",
      });
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
          toast({
            type: "error",
            title: "Reset Failed",
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
          toast({
            type: "error",
            title: "Update Failed",
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
        } catch {}
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
      router.push("/login");
    },
  });
}

export function useGoogleAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (idToken: string) => {
      return googleAuthApi({ idToken, intents: ["cap"] });
    },

    onSuccess: async (data) => {
      saveTokens(data.accessToken, data.refreshToken);
      saveUser({
        userId: data.user.userId || data.user.id || "",
        email: data.user.email,
        status: data.user.status,
        intents: data.user.intents || [],
        createdAt: data.user.createdAt || new Date().toISOString(),
      });

      dispatch(
        setCredentials({
          user: {
            userId: data.user.userId || data.user.id || "",
            email: data.user.email,
            status: data.user.status,
            intents: data.user.intents,
            createdAt: data.user.createdAt,
            isVerified: data.user.status === "active",
          },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );

      toast({
        type: "success",
        title: data.isNewUser ? "Welcome!" : "Welcome Back!",
        description: `Signed in as ${data.user.email}`,
      });

      try {
        const [res, profile, meRes] = await Promise.allSettled([
          getOnboardingMineApi(),
          getCandidateProfileApi(),
          getMeApi(),
        ]);

        if (profile.status === "fulfilled" && profile.value?.identityVerified) {
          dispatch(markVerified());
        }

        if (meRes.status === "fulfilled") {
          if (meRes.value.identityVerified) {
            dispatch(markVerified());
          }
          if (meRes.value.centres && meRes.value.centres.length > 0) {
            const activeCentre = meRes.value.centres[0];
            const role = activeCentre.role || "super_admin";
            saveCentreId(activeCentre.centreId);
            saveCentreRole(role);
            dispatch(setCentreId(activeCentre.centreId));
            dispatch(setCentreRole(role));
          }
        }

        const userEmail = data.user.email;

        if (res.status === "fulfilled") {
          const { isOnboarded, persona } = parseOnboardingMine(res.value);

          if (persona) {
            savePersona(persona);
            if (persona === "centre") {
              const centreRole =
                meRes.status === "fulfilled" && meRes.value.centres?.[0]?.role
                  ? meRes.value.centres[0].role
                  : "super_admin";
              dispatch(setRole(centreRole));
              saveCentreRole(centreRole);
            } else {
              dispatch(setRole(persona));
            }
          }

          saveOnboardedStatus(isOnboarded);
          const destination = resolveUserDestination(
            isOnboarded,
            persona,
            userEmail,
          );
          router.push(destination);
        } else {
          saveOnboardedStatus(false);
          const destination = resolveUserDestination(false, null, userEmail);
          router.push(destination);
        }
      } catch {
        saveOnboardedStatus(false);
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

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      mutation.mutate(credentialResponse.credential);
    } else {
      toast({
        type: "error",
        title: "Google Sign-In Failed",
        description: "Unable to retrieve authentication token.",
      });
    }
  };

  const handleGoogleError = () => {
    toast({
      type: "error",
      title: "Google Sign-In Cancelled",
      description: "Google sign-in was cancelled or encountered an issue.",
    });
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
    mutate: mutation.mutate,
    isPending: mutation.isPending,
  };
}

/**
 * Composite useAuth hook grouping all authentication operations
 */
export function useAuth() {
  const register = useRegister();
  const verifyAccount = useVerifyAccount();
  const resendOtp = useResendOtp();
  const login = useLogin();
  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();
  const changePassword = useChangePassword();
  const logout = useLogout();
  const googleAuth = useGoogleAuth();

  return {
    register,
    verifyAccount,
    resendOtp,
    login,
    forgotPassword,
    resetPassword,
    changePassword,
    logout,
    googleAuth,
  };
}
