import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
} from "redux-persist";
import { localStorage, sessionStorage } from "./storage";
import { authReducer } from "./slices/authSlice";
import { sessionReducer } from "./slices/sessionSlice";
import { applicationReducer } from "./slices/applicationSlice";
import { onboardingReducer } from "./slices/onboardingSlice";

// // LocalStorage configuration for Auth
// const authPersistConfig = {
//   key: "auth",
//   storage: localStorage,
//   whitelist: ["user", "token", "refreshToken", "isAuthenticated"],
// };

// // LocalStorage configuration for Applications
// const applicationPersistConfig = {
//   key: "applications",
//   storage: localStorage,
//   whitelist: ["applications", "currentApplicationId"],
// };

// // SessionStorage configuration for Session
// const sessionPersistConfig = {
//   key: "session",
//   storage: sessionStorage,
//   whitelist: ["otpCode", "flow", "tempFormData"],
// };

// // SessionStorage configuration for Onboarding wizard form
// const onboardingPersistConfig = {
//   key: "onboarding",
//   storage: sessionStorage,
//   whitelist: ["role", "assessmentType", "personalInfo", "startApplication"],
// };


const persistConfig = {
  key: 'root',
  storage: sessionStorage,
};


const rootReducer = combineReducers({
  auth: authReducer,
  session: sessionReducer,
  application: applicationReducer,
  onboarding: onboardingReducer,
});


const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
