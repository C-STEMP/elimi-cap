"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { ToastSuccessIcon, ToastErrorIcon, ToastInfoIcon } from "./svg-icons";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void;
  toasts: Toast[];
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    ({ type, title, description, duration = 4000 }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [
        ...prev,
        { id, type, title, description, duration },
      ]);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  dismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, dismiss }) => {
  return (
    <div
      suppressHydrationWarning
      className="fixed top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-auto z-50 flex flex-col gap-4 w-[calc(100%-2rem)] sm:w-full sm:max-w-90 pointer-events-none select-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  const { type, title, description, duration = 4000 } = toast;
  const [width, setWidth] = useState("100%");

  useEffect(() => {
    // Start the transition after mount
    const timer = setTimeout(() => {
      setWidth("0%");
    }, 10);

    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onDismiss]);

  const progressBarColor =
    type === "success"
      ? "bg-[#1E7F4C]"
      : type === "error"
        ? "bg-[#B3261E]"
        : "bg-secondary";

  const renderToastIcon = () => {
    if (type === "success") return <ToastSuccessIcon />;
    if (type === "error") return <ToastErrorIcon />;
    return <ToastInfoIcon />;
  };

  return (
    <div
      suppressHydrationWarning
      onClick={onDismiss}
      className="relative w-full bg-white rounded-2xl overflow-hidden p-4 pb-5 flex items-start gap-3 pointer-events-auto cursor-pointer transition-all duration-300 animate-slide-in"
      style={{
        boxShadow: "4px 4px 11.6px 0px rgba(0, 0, 0, 0.15)",
      }}
    >
      {renderToastIcon()}
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-bold text-text-dark leading-tight">
          {title}
        </span>
        <span className="text-[13px] font-normal text-neutral-secondary leading-tight">
          {description}
        </span>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-1 ${progressBarColor}`}
        style={{
          width,
          transition: `width ${duration}ms linear`,
        }}
      />
    </div>
  );
};
