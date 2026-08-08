import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Personal Info ────────────────────────────────────────────────────────────

export interface PersonalInfoFields {
  firstName: string;
  lastName: string;
  middleName: string;
  dob: string;
  gender: string;
  nationality: string;
  email: string;
  phoneNumber: string;
  country: string;
  state: string;
  lga: string;
  streetAddress: string;
  impairment: string;
  /** Passport photo is not serialisable; store only the name as a hint */
  passportFileName: string;
}

// ─── Start Application ────────────────────────────────────────────────────────

export interface StartApplicationFields {
  assessmentCenter: string;
  sector: string;
  trade: string;
}

// ─── Slice state ─────────────────────────────────────────────────────────────

export interface OnboardingState {
  role: string;
  assessmentType: string;
  personalInfo: PersonalInfoFields;
  startApplication: StartApplicationFields;
}

const initialPersonalInfo: PersonalInfoFields = {
  firstName: "",
  lastName: "",
  middleName: "",
  dob: "",
  gender: "",
  nationality: "",
  email: "",
  phoneNumber: "",
  country: "",
  state: "",
  lga: "",
  streetAddress: "",
  impairment: "",
  passportFileName: "",
};

const initialStartApplication: StartApplicationFields = {
  assessmentCenter: "",
  sector: "",
  trade: "",
};

const initialState: OnboardingState = {
  role: "",
  assessmentType: "",
  personalInfo: initialPersonalInfo,
  startApplication: initialStartApplication,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

export const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setOnboardingRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
    },
    setOnboardingAssessmentType: (state, action: PayloadAction<string>) => {
      state.assessmentType = action.payload;
    },
    setPersonalInfo: (
      state,
      action: PayloadAction<Partial<PersonalInfoFields>>
    ) => {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },
    updatePersonalInfoField: (
      state,
      action: PayloadAction<{ field: keyof PersonalInfoFields; value: string }>
    ) => {
      state.personalInfo[action.payload.field] = action.payload.value;
    },
    setStartApplication: (
      state,
      action: PayloadAction<Partial<StartApplicationFields>>
    ) => {
      state.startApplication = {
        ...state.startApplication,
        ...action.payload,
      };
    },
    resetOnboarding: () => initialState,
  },
});

export const {
  setOnboardingRole,
  setOnboardingAssessmentType,
  setPersonalInfo,
  updatePersonalInfoField,
  setStartApplication,
  resetOnboarding,
} = onboardingSlice.actions;

export const onboardingReducer = onboardingSlice.reducer;
