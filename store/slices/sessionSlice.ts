import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SessionState {
  otpCode: string[];
  flow: "signup" | "forgot" | "verify";
  tempFormData: Record<string, any>;
}

const initialState: SessionState = {
  otpCode: ["4", "8", "2", "", "", ""],
  flow: "signup",
  tempFormData: {},
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setOtpCode: (state, action: PayloadAction<string[]>) => {
      state.otpCode = action.payload;
    },
    setFlow: (state, action: PayloadAction<"signup" | "forgot" | "verify">) => {
      state.flow = action.payload;
    },
    saveTempData: (state, action: PayloadAction<Record<string, any>>) => {
      state.tempFormData = { ...state.tempFormData, ...action.payload };
    },
    resetSession: () => initialState,
  },
});

export const { setOtpCode, setFlow, saveTempData, resetSession } =
  sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
