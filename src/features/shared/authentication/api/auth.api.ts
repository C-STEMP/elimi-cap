import { orchestratorFetch } from "@/src/lib/api/orchestrator";

export interface AuthUser {
  userId?: string;
  id?: string;
  email: string;
  phone?: string | null;
  authProvider?: string;
  status: "pending_verification" | "active" | "suspended";
  intents: string[];
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: AuthUser;
}

export type OtpPurpose = "account_verify" | "password_reset";

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  status: "pending_verification";
}

export async function registerApi(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  return orchestratorFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    data: {
      email: payload.email,
      password: payload.password,
      intents: ["cap"],
    },
  });
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export async function verifyAccountApi(
  payload: VerifyAccountPayload,
): Promise<AuthResult> {
  return orchestratorFetch<AuthResult>("/auth/verify-account", {
    method: "POST",
    data: {
      email: payload.email,
      otp: payload.otp,
      purpose: "account_verify" as OtpPurpose,
    },
  });
}

export interface ResendOtpPayload {
  email: string;
  purpose: OtpPurpose;
}

export async function resendOtpApi(payload: ResendOtpPayload): Promise<void> {
  await orchestratorFetch<void>("/auth/otp/resend", {
    method: "POST",
    data: payload,
  });
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function loginApi(payload: LoginPayload): Promise<AuthResult> {
  return orchestratorFetch<AuthResult>("/auth/login", {
    method: "POST",
    data: payload,
  });
}

export interface GoogleAuthPayload {
  idToken: string;
  intents?: string[];
}

export interface GoogleAuthResult extends AuthResult {
  isNewUser: boolean;
}

export async function googleAuthApi(
  payload: GoogleAuthPayload,
): Promise<GoogleAuthResult> {
  return orchestratorFetch<GoogleAuthResult>("/auth/google", {
    method: "POST",
    data: {
      idToken: payload.idToken,
      provider: "google",
      intents: payload.intents ?? ["cap"],
    },
  });
}

export interface ForgotPasswordPayload {
  email: string;
}

export async function forgotPasswordApi(
  payload: ForgotPasswordPayload,
): Promise<void> {
  await orchestratorFetch<void>("/auth/forgot-password", {
    method: "POST",
    data: payload,
  });
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export async function resetPasswordApi(
  payload: ResetPasswordPayload,
): Promise<void> {
  await orchestratorFetch<void>("/auth/reset-password", {
    method: "POST",
    data: {
      email: payload.email,
      otp: payload.otp,
      purpose: "password_reset" as OtpPurpose,
      newPassword: payload.newPassword,
    },
  });
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePasswordApi(
  payload: ChangePasswordPayload,
): Promise<void> {
  await orchestratorFetch<void>("/auth/change-password", {
    method: "PATCH",
    data: payload,
  });
}

export interface LogoutPayload {
  refreshToken: string;
}

export async function logoutApi(payload: LogoutPayload): Promise<void> {
  await orchestratorFetch<void>("/auth/logout", {
    method: "POST",
    data: payload,
  });
}
