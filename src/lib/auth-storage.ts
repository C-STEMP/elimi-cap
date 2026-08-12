const ACCESS_TOKEN_KEY = "elimi_access_token";
const REFRESH_TOKEN_KEY = "elimi_refresh_token";
const USER_KEY = "elimi_user";

export interface StoredUser {
  userId: string;
  email: string;
  status: "pending_verification" | "active" | "suspended";
  intents: string[];
  createdAt: string;
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  if (!accessToken || !refreshToken) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(accessToken)}; path=/; max-age=604800; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_KEY}=${encodeURIComponent(refreshToken)}; path=/; max-age=604800; SameSite=Lax`;
}

export function saveOnboardedStatus(isOnboarded: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("elimi_onboarded", String(isOnboarded));
  document.cookie = `elimi_onboarded=${isOnboarded}; path=/; max-age=604800; SameSite=Lax`;
}

export function getOnboardedStatus(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("elimi_onboarded") === "true";
}

export function saveLastOnboardingRoute(route: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("elimi_last_onboarding_route", route);
}

export function getLastOnboardingRoute(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("elimi_last_onboarding_route");
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveUser(user: StoredUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function savePersona(persona: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("elimi_persona", persona);
}

export function getPersona(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("elimi_persona");
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("elimi_onboarded");
  localStorage.removeItem("elimi_persona");
  sessionStorage.clear();
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `elimi_onboarded=; path=/; max-age=0; SameSite=Lax`;
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
