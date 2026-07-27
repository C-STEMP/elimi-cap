import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { localStorage, sessionStorage } from "./storage";
import { authReducer } from "./slices/authSlice";
import { sessionReducer } from "./slices/sessionSlice";

// LocalStorage configuration for Auth
const authPersistConfig = {
  key: "auth",
  storage: localStorage,
  whitelist: ["user", "token", "isAuthenticated"],
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
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
