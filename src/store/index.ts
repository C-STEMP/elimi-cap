import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { localStorage } from "./storage";
import { authReducer } from "./slices/authSlice";
import { sessionReducer } from "./slices/sessionSlice";
import { applicationReducer } from "./slices/applicationSlice";
import { onboardingReducer } from "./slices/onboardingSlice";

const persistConfig = {
  key: "root",
  storage: localStorage,
  whitelist: ["auth", "session"],
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
