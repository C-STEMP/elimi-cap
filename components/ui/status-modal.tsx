import React from "react";
import Image from "next/image";
import { Button } from "./button";
import { successCheckmarkImg, progressSavedIcon, submitedIcon } from "@/assets";

interface StatusModalProps {
  isOpen: boolean;
  onClose?: () => void;
  type?: "success" | "error";
  variant?: "default" | "draft-saved" | "application-submitted";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  iconSrc?: string;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  type = "success",
  variant = "default",
  title,
  description,
  actionLabel = "Go To Dashboard",
  onAction,
  iconSrc,
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    if (variant === "draft-saved") {
      return (
        <Image
          src={progressSavedIcon}
          alt="Progress Saved"
          width={180}
          height={180}
          className="object-contain"
          style={{ width: "180px", height: "auto" }}
          priority
        />
      );
    }

    if (variant === "application-submitted") {
      return (
        <Image
          src={submitedIcon}
          alt="Application Submitted"
          width={180}
          height={180}
          className="object-contain"
          style={{ width: "180px", height: "auto" }}
          priority
        />
      );
    }

    if (iconSrc) {
      return (
        <Image
          src={iconSrc}
          alt={title || "Status"}
          width={180}
          height={180}
          className="object-contain"
          style={{ width: "180px", height: "auto" }}
          priority
        />
      );
    }

    if (type === "success") {
      return (
        <Image
          src={successCheckmarkImg}
          alt="Success Checkmark"
          width={180}
          height={180}
          className="object-contain"
          style={{ width: "180px", height: "auto" }}
          priority
        />
      );
    }

    return (
      <div className="w-35 h-35 flex items-center justify-center bg-red-50 rounded-full border-4 border-red-100 shadow-sm animate-pulse">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="#B3261E" />
          <path
            d="M8 8L16 16M16 8L8 16"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  const modalTitle =
    title ||
    (variant === "draft-saved"
      ? "Progress Saved"
      : variant === "application-submitted"
        ? "Application Submit"
        : "Success");

  const modalDescription =
    description ||
    (variant === "draft-saved"
      ? "Great! Your progress has been securely saved as a draft. You can return at any time to continue your application from where you left off. No information you've entered will be lost."
      : variant === "application-submitted"
        ? "Thank you for submitting your Recognition of Prior Learning (RPL) application. Your application has been successfully submitted and is now awaiting review by your selected Assessment Centre."
        : "");

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4xl p-10 max-w-105 w-full flex flex-col items-center text-center shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-neutral-secondary hover:text-text-dark transition-colors focus:outline-none cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div className="w-35 h-35 mt-6 relative flex items-center justify-center">
          {renderIcon()}
        </div>

        <h2 className="text-2xl font-extrabold text-neutral-primary mt-6 tracking-tight">
          {modalTitle}
        </h2>

        <p className="text-neutral-secondary text-[14px] leading-relaxed mt-2 font-normal max-w-70">
          {modalDescription}
        </p>

        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            variant="secondary"
            size="normal"
            className="w-full h-12.5 text-white font-bold text-base bg-secondary hover:bg-secondary-hover mt-8 transition-all shadow-sm cursor-pointer"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
