import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
} from "redux-persist";
import { localStorage, sessionStorage } from "./storage";
import { authReducer } from "./slices/authSlice";
import { sessionReducer } from "./slices/sessionSlice";
import { applicationReducer } from "./slices/applicationSlice";

// LocalStorage configuration for Auth
const authPersistConfig = {
  key: "auth",
  storage: localStorage,
  whitelist: ["user", "token", "refreshToken", "isAuthenticated"],
};

// LocalStorage configuration for Applications
const applicationPersistConfig = {
  key: "applications",
  storage: localStorage,
  whitelist: ["applications", "currentApplicationId"],
};

// SessionStorage configuration for Session
const sessionPersistConfig = {
  key: "session",
  storage: sessionStorage,
  whitelist: ["otpCode", "flow", "tempFormData"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  session: persistReducer(sessionPersistConfig, sessionReducer),
  application: persistReducer(applicationPersistConfig, applicationReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
