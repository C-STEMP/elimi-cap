"use client";

import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { queryClient } from "@/src/lib/query-client";
import { store, persistor } from "./index";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [client] = React.useState(() => queryClient);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={client}>
          <GoogleOAuthProvider clientId={googleClientId}>
            {children}
          </GoogleOAuthProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};
