import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PersonalInfoState {
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
  passportFileName: string;
}

export interface StartApplicationState {
  assessmentCenter: string;
  sector: string;
  trade: string;
}

export interface OnboardingState {
  role: string;
  assessmentType: string;
  personalInfo: PersonalInfoState;
  startApplication: StartApplicationState;
}

const initialState: OnboardingState = {
  role: "",
  assessmentType: "",
  personalInfo: {
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
  },
  startApplication: {
    assessmentCenter: "",
    sector: "",
    trade: "",
  },
};

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
      action: PayloadAction<Partial<PersonalInfoState>>
    ) => {
      state.personalInfo = {
        ...state.personalInfo,
        ...action.payload,
      };
    },
    setStartApplication: (
      state,
      action: PayloadAction<Partial<StartApplicationState>>
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
  setStartApplication,
  resetOnboarding,
} = onboardingSlice.actions;

export const onboardingReducer = onboardingSlice.reducer;
