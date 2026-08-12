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

export interface CentreInformationState {
  centerName: string;
  regNo: string;
  country: string;
  state: string;
  lga: string;
  streetAddress: string;
  supportEmail: string;
  phoneNumber: string;
  bank: string;
  accountNumber: string;
  nameOnAccount: string;
  logoAssetId?: string;
  logoPreview?: string;
}

export interface CentrePersonalInfoState {
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
}

export interface CentreIdentityState {
  nin: string;
  isVerified: boolean;
}

export interface RPLExperienceTradeState {
  qualificationTitle: string;
  qualificationCode: string;
  completedBefore: string;
  previousAssessmentDetails: string;
  assessmentType: string;
  individualUnit: string[];
  occupation: string;
  yearsOfExperience: string;
  employments: {
    id: string;
    companyName: string;
    jobTitle: string;
    employmentType: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
  }[];
  reasonRPL: string;
  selectedEvidence: string[];
  otherEvidenceText: string;
}

export interface RPLIdentityState {
  nin: string;
  isVerified: boolean;
}

export interface AssessorPersonalInfoState {
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
  passportFileName?: string;
  passportPreview?: string;
  passportAssetId?: string;
}

export interface AssessorDetailsState {
  assessorId: string;
  qualifications: string[];
  qaaCertificateAssetId?: string;
  qaaCertificateName?: string;
  qaaCertificateSize?: string;
  iqmCertificateAssetId?: string;
  iqmCertificateName?: string;
  iqmCertificateSize?: string;
}

export interface AssessorIdentityState {
  nin: string;
  isVerified: boolean;
}

export interface OnboardingState {
  role: string;
  assessmentType: string;
  personalInfo: PersonalInfoState;
  startApplication: StartApplicationState;
  centreInformation: CentreInformationState;
  centrePersonalInfo: CentrePersonalInfoState;
  centreIdentity: CentreIdentityState;
  rplExperienceTrade: RPLExperienceTradeState;
  rplIdentity: RPLIdentityState;
  assessorPersonalInfo: AssessorPersonalInfoState;
  assessorDetails: AssessorDetailsState;
  assessorIdentity: AssessorIdentityState;
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
  centreInformation: {
    centerName: "",
    regNo: "",
    country: "Nigeria",
    state: "",
    lga: "",
    streetAddress: "",
    supportEmail: "",
    phoneNumber: "",
    bank: "",
    accountNumber: "",
    nameOnAccount: "",
    logoAssetId: "",
    logoPreview: "",
  },
  centrePersonalInfo: {
    firstName: "",
    lastName: "",
    middleName: "",
    dob: "",
    gender: "",
    nationality: "",
    email: "",
    phoneNumber: "",
    country: "Nigeria",
    state: "",
    lga: "",
    streetAddress: "",
  },
  centreIdentity: {
    nin: "",
    isVerified: false,
  },
  rplExperienceTrade: {
    qualificationTitle: "",
    qualificationCode: "NOS-ELI-L3",
    completedBefore: "No",
    previousAssessmentDetails: "",
    assessmentType: "",
    individualUnit: [],
    occupation: "",
    yearsOfExperience: "",
    employments: [
      {
        id: "1",
        companyName: "",
        jobTitle: "",
        employmentType: "",
        startDate: "",
        endDate: "",
        responsibilities: "",
      },
    ],
    reasonRPL: "",
    selectedEvidence: [],
    otherEvidenceText: "",
  },
  rplIdentity: {
    nin: "",
    isVerified: false,
  },
  assessorPersonalInfo: {
    firstName: "",
    lastName: "",
    middleName: "",
    dob: "",
    gender: "",
    nationality: "",
    email: "",
    phoneNumber: "",
    country: "Nigeria",
    state: "",
    lga: "",
    streetAddress: "",
    passportFileName: "",
    passportPreview: "",
    passportAssetId: "",
  },
  assessorDetails: {
    assessorId: "",
    qualifications: [],
    qaaCertificateAssetId: "",
    qaaCertificateName: "",
    qaaCertificateSize: "",
    iqmCertificateAssetId: "",
    iqmCertificateName: "",
    iqmCertificateSize: "",
  },
  assessorIdentity: {
    nin: "",
    isVerified: false,
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
    setCentreInformation: (
      state,
      action: PayloadAction<Partial<CentreInformationState>>
    ) => {
      state.centreInformation = {
        ...state.centreInformation,
        ...action.payload,
      };
    },
    setCentrePersonalInfo: (
      state,
      action: PayloadAction<Partial<CentrePersonalInfoState>>
    ) => {
      state.centrePersonalInfo = {
        ...state.centrePersonalInfo,
        ...action.payload,
      };
    },
    setCentreIdentity: (
      state,
      action: PayloadAction<Partial<CentreIdentityState>>
    ) => {
      state.centreIdentity = {
        ...state.centreIdentity,
        ...action.payload,
      };
    },
    setRPLExperienceTrade: (
      state,
      action: PayloadAction<Partial<RPLExperienceTradeState>>
    ) => {
      state.rplExperienceTrade = {
        ...state.rplExperienceTrade,
        ...action.payload,
      };
    },
    setRPLIdentity: (
      state,
      action: PayloadAction<Partial<RPLIdentityState>>
    ) => {
      state.rplIdentity = {
        ...state.rplIdentity,
        ...action.payload,
      };
    },
    setAssessorPersonalInfo: (
      state,
      action: PayloadAction<Partial<AssessorPersonalInfoState>>
    ) => {
      state.assessorPersonalInfo = {
        ...state.assessorPersonalInfo,
        ...action.payload,
      };
    },
    setAssessorDetails: (
      state,
      action: PayloadAction<Partial<AssessorDetailsState>>
    ) => {
      state.assessorDetails = {
        ...state.assessorDetails,
        ...action.payload,
      };
    },
    setAssessorIdentity: (
      state,
      action: PayloadAction<Partial<AssessorIdentityState>>
    ) => {
      state.assessorIdentity = {
        ...state.assessorIdentity,
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
  setCentreInformation,
  setCentrePersonalInfo,
  setCentreIdentity,
  setRPLExperienceTrade,
  setRPLIdentity,
  setAssessorPersonalInfo,
  setAssessorDetails,
  setAssessorIdentity,
  resetOnboarding,
} = onboardingSlice.actions;

export const onboardingReducer = onboardingSlice.reducer;


