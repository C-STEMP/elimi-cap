import { orchestratorFetch } from "@/lib/api/client";

export interface AuthUser {
  userId: string;
  email: string;
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
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      intents: ["cap"],
    }),
  });
}

export interface VerifyAccountPayload {
  email: string;
  otp: string; // 4 digits
}

export async function verifyAccountApi(
  payload: VerifyAccountPayload,
): Promise<AuthResult> {
  return orchestratorFetch<AuthResult>("/auth/verify-account", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      otp: payload.otp,
      purpose: "account_verify" as OtpPurpose,
    }),
  });
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export interface ResendOtpPayload {
  email: string;
  purpose: OtpPurpose;
}

export async function resendOtpApi(payload: ResendOtpPayload): Promise<void> {
  await orchestratorFetch<void>("/auth/otp/resend", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export async function loginApi(payload: LoginPayload): Promise<AuthResult> {
  return orchestratorFetch<AuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Google Auth ──────────────────────────────────────────────────────────────

export interface GoogleAuthPayload {
  idToken: string;
}

export interface GoogleAuthResult extends AuthResult {
  isNewUser: boolean;
}

export async function googleAuthApi(
  payload: GoogleAuthPayload,
): Promise<GoogleAuthResult> {
  return orchestratorFetch<GoogleAuthResult>("/auth/google", {
    method: "POST",
    body: JSON.stringify({
      idToken: payload.idToken,
      provider: "google",
      intents: ["cap"],
    }),
  });
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export interface ForgotPasswordPayload {
  email: string;
}

/** Always returns void — response is the same whether email exists or not (anti-enumeration) */
export async function forgotPasswordApi(
  payload: ForgotPasswordPayload,
): Promise<void> {
  await orchestratorFetch<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export interface ResetPasswordPayload {
  email: string;
  otp: string; // 4 digits
  newPassword: string;
}

export async function resetPasswordApi(
  payload: ResetPasswordPayload,
): Promise<void> {
  await orchestratorFetch<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      otp: payload.otp,
      purpose: "password_reset" as OtpPurpose,
      newPassword: payload.newPassword,
    }),
  });
}

// ─── Change Password (authenticated) ─────────────────────────────────────────

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePasswordApi(
  payload: ChangePasswordPayload,
): Promise<void> {
  await orchestratorFetch<void>("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export interface LogoutPayload {
  refreshToken: string;
}

export async function logoutApi(payload: LogoutPayload): Promise<void> {
  await orchestratorFetch<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
