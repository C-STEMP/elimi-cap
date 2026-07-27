import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  email: string;
  fullName?: string;
  isVerified?: boolean;
  role?: string;
  assessmentType?: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sidebarVariant: "default" | "rpl-form";
  rplStep: number;
}

const initialState: AuthState = {
  user: {
    email: "chidi.umeh@email.com",
    fullName: "Chidi Umeh",
    isVerified: true,
  },
  token: null,
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
      action: PayloadAction<{ user: UserProfile; token?: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token || null;
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
