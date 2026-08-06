import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "payment_pending"
  | "payment_completed"
  | "folder_arrangement"
  | "self_assessment"
  | "evidence_upload"
  | "interview_scheduled"
  | "interview_completed"
  | "certification";

export interface Application {
  id: string;
  title: string;
  subtitle: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  selfAssessmentCompleted: boolean;
  paymentCompleted: boolean;
  evidenceUploaded: boolean;
}

export interface ApplicationState {
  applications: Application[];
  currentApplicationId: string | null;
}

const DEFAULT_MOCK_APPLICATION: Application = {
  id: "app-1786013185522",
  title: "National Vocational Qualification in Carpentry",
  subtitle: "NSQ Level 3",
  status: "evidence_upload",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  selfAssessmentCompleted: true,
  paymentCompleted: true,
  evidenceUploaded: false,
};

const initialState: ApplicationState = {
  applications: [DEFAULT_MOCK_APPLICATION],
  currentApplicationId: "app-1786013185522",
};

export const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    createApplication: (
      state,
      action: PayloadAction<{ title: string; subtitle: string }>
    ) => {
      const newApp: Application = {
        id: `app-${Date.now()}`,
        title: action.payload.title,
        subtitle: action.payload.subtitle,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        selfAssessmentCompleted: false,
        paymentCompleted: false,
        evidenceUploaded: false,
      };
      state.applications.push(newApp);
      state.currentApplicationId = newApp.id;
    },
    setCurrentApplication: (state, action: PayloadAction<string>) => {
      state.currentApplicationId = action.payload;
    },
    updateApplicationStatus: (
      state,
      action: PayloadAction<{ id: string; status: ApplicationStatus }>
    ) => {
      const app = state.applications.find((a) => a.id === action.payload.id);
      if (app) {
        app.status = action.payload.status;
        app.updatedAt = new Date().toISOString();
      }
    },
    markSelfAssessmentComplete: (state, action: PayloadAction<string>) => {
      const app = state.applications.find((a) => a.id === action.payload);
      if (app) {
        app.selfAssessmentCompleted = true;
        app.status = "payment_pending";
        app.updatedAt = new Date().toISOString();
      }
    },
    markPaymentComplete: (state, action: PayloadAction<string>) => {
      const app = state.applications.find((a) => a.id === action.payload);
      if (app) {
        app.paymentCompleted = true;
        app.status = "folder_arrangement";
        app.updatedAt = new Date().toISOString();
      }
    },
    markEvidenceUploaded: (state, action: PayloadAction<string>) => {
      const app = state.applications.find((a) => a.id === action.payload);
      if (app) {
        app.evidenceUploaded = true;
        app.status = "evidence_upload";
        app.updatedAt = new Date().toISOString();
      }
    },
    markInterviewCompleted: (state, action: PayloadAction<string>) => {
      const app = state.applications.find((a) => a.id === action.payload);
      if (app) {
        app.status = "interview_completed";
        app.updatedAt = new Date().toISOString();
      }
    },
    markInternalVerifierCompleted: (state, action: PayloadAction<string>) => {
      const app = state.applications.find((a) => a.id === action.payload);
      if (app) {
        app.status = "interview_scheduled";
        app.updatedAt = new Date().toISOString();
      }
    },
    markExternalVerifierCompleted: (state, action: PayloadAction<string>) => {
      const app = state.applications.find((a) => a.id === action.payload);
      if (app) {
        app.status = "certification";
        app.updatedAt = new Date().toISOString();
      }
    },
    deleteApplication: (state, action: PayloadAction<string>) => {
      state.applications = state.applications.filter(
        (a) => a.id !== action.payload
      );
      if (state.currentApplicationId === action.payload) {
        state.currentApplicationId = null;
      }
    },
    clearApplications: (state) => {
      state.applications = [];
      state.currentApplicationId = null;
    },
  },
});

export const {
  createApplication,
  setCurrentApplication,
  updateApplicationStatus,
  markSelfAssessmentComplete,
  markPaymentComplete,
  markEvidenceUploaded,
  markInterviewCompleted,
  markInternalVerifierCompleted,
  markExternalVerifierCompleted,
  deleteApplication,
  clearApplications,
} = applicationSlice.actions;

export const applicationReducer = applicationSlice.reducer;
