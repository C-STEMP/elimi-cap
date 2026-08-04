"use client";

import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { store, persistor } from "./index";

export const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [client] = React.useState(() => queryClient);

  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <PersistGate loading={children} persistor={persistor}>
          {children}
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  );
};
