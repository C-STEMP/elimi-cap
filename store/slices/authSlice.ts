import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/** Shape returned by the Orchestrator API on login/register */
export interface UserProfile {
  // From API
  userId?: string;
  id?: string;
  email: string;
  status?: "pending_verification" | "active" | "suspended";
  intents?: string[];
  createdAt?: string;
  // UI / onboarding fields
  fullName?: string;
  isVerified?: boolean;
  role?: string;
  assessmentType?: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sidebarVariant: "default" | "rpl-form";
  rplStep: number;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  sidebarVariant: "default",
  rplStep: 1,
};


export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserProfile; accessToken?: string; refreshToken?: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken ?? null;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.isAuthenticated = true;
    },
    updateEmail: (state, action: PayloadAction<string>) => {
      if (!state.user) {
        state.user = { email: action.payload };
      } else {
        state.user.email = action.payload;
      }
    },
    setRole: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.role = action.payload;
      } else {
        state.user = { email: "", role: action.payload };
      }
    },
    setAssessmentType: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.assessmentType = action.payload;
      } else {
        state.user = { email: "", assessmentType: action.payload };
      }
    },
    setSidebarVariant: (
      state,
      action: PayloadAction<"default" | "rpl-form">
    ) => {
      state.sidebarVariant = action.payload;
    },
    setRplStep: (state, action: PayloadAction<number>) => {
      state.rplStep = action.payload;
    },
    markVerified: (state) => {
      if (state.user) {
        state.user.isVerified = true;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const {
  setCredentials,
  updateEmail,
  setRole,
  setAssessmentType,
  setSidebarVariant,
  setRplStep,
  markVerified,
  logout,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
