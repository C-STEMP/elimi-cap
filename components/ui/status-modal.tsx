import React from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { Button } from "./button";
import { ASSETS_URL } from "@/assets";
import {
  PaymentSuccessIllustration,
  PaymentCancelledIllustration,
  PaymentUnsuccessfulIllustration,
  ErrorCircleIcon,
} from "./svg-icons";

export type StatusModalVariant =
  | "default"
  | "draft-saved"
  | "application-submitted"
  | "payment-successful"
  | "payment-cancelled"
  | "payment-unsuccessful"
  | "processing-payment";

interface StatusModalProps {
  isOpen: boolean;
  onClose?: () => void;
  type?: "success" | "error";
  variant?: StatusModalVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  iconSrc?: string;
  customIcon?: React.ReactNode;
}

const ProcessingPaymentIllustration = () => (
  <div className="relative w-16 h-16 animate-spin my-2">
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = i * 45;
      const opacity = (i + 1) / 8;
      return (
        <div
          key={i}
          className="absolute top-0 left-1/2 -ml-1 w-2.5 h-4.5 rounded-full bg-black"
          style={{
            transformOrigin: "50% 32px",
            transform: `rotate(${angle}deg)`,
            opacity: opacity < 0.2 ? 0.2 : opacity,
          }}
        />
      );
    })}
  </div>
);

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  type = "success",
  variant = "default",
  title,
  description,
  actionLabel,
  onAction,
  iconSrc,
  customIcon,
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    if (customIcon) return customIcon;
    if (variant === "payment-successful") {
      return (
        <Image
          src={ASSETS_URL.paymentSuccessfulIcon}
          alt="Payment Successful"
          width={180}
          height={180}
          className="w-auto h-auto object-contain"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      );
    }
    if (variant === "payment-cancelled") {
      return (
        <Image
          src={ASSETS_URL.paymentCancelledIcon}
          alt="Payment Cancelled"
          width={180}
          height={180}
          className="w-auto h-auto object-contain"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      );
    }
    if (variant === "payment-unsuccessful") {
      return (
        <Image
          src={ASSETS_URL.paymentUnsuccessfulIcon}
          alt="Payment Unsuccessful"
          width={180}
          height={180}
          className="w-auto h-auto object-contain"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      );
    }
    if (variant === "processing-payment") {
      return (
        <Image
          src={ASSETS_URL.loadingIcon}
          alt="Processing Payment"
          width={80}
          height={80}
          className="w-auto h-auto object-contain animate-spin my-4"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      );
    }

    if (variant === "draft-saved") {
      return (
        <Image
          src={ASSETS_URL.progressSavedIcon}
          alt="Progress Saved"
          width={180}
          height={180}
          className="w-auto h-auto object-contain"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      );
    }

    if (variant === "application-submitted") {
      return (
        <Image
          src={ASSETS_URL.submitedIcon}
          alt="Application Submitted"
          width={180}
          height={180}
          className="w-auto h-auto object-contain"
          style={{ width: "auto", height: "auto" }}
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
          className="w-auto h-auto object-contain"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      );
    }

    if (type === "success") {
      return (
        <Image
          src={ASSETS_URL.successCheckmarkImg}
          alt="Success Checkmark"
          width={180}
          height={180}
          className="w-auto h-auto object-contain"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      );
    }

    return (
      <div className="w-35 h-35 flex items-center justify-center bg-red-50 rounded-full border-4 border-red-100 shadow-sm animate-pulse">
        <ErrorCircleIcon />
      </div>
    );
  };

  const modalTitle =
    title ||
    (variant === "draft-saved"
      ? "Progress Saved"
      : variant === "application-submitted"
        ? "Application Submit"
        : variant === "payment-successful"
          ? "Payment Successful"
          : variant === "payment-cancelled"
            ? "Payment Cancelled"
            : variant === "payment-unsuccessful"
              ? "Payment Unsuccessful"
              : variant === "processing-payment"
                ? "Processing Payment"
                : "Success");

  const modalDescription =
    description ||
    (variant === "draft-saved"
      ? "Great! Your progress has been securely saved as a draft. You can return at any time to continue your application from where you left off. No information you've entered will be lost."
      : variant === "application-submitted"
        ? "Thank you for submitting your Recognition of Prior Learning (RPL) application. Your application has been successfully submitted and is now awaiting review by your selected Assessment Centre."
        : variant === "payment-successful"
          ? "Your payment was made successfully"
          : variant === "payment-cancelled"
            ? "Your payment was cancelled"
            : variant === "payment-unsuccessful"
              ? "Your payment was not successful"
              : variant === "processing-payment"
                ? "Please wait while we process your payment"
                : "");

  const modalActionLabel =
    actionLabel !== undefined
      ? actionLabel
      : variant === "payment-successful"
        ? "Start Folder Arrangement"
        : variant === "payment-cancelled" || variant === "payment-unsuccessful"
          ? "Try again"
          : variant === "processing-payment"
            ? undefined
            : "Go To Dashboard";

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 transition-opacity duration-300 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4xl p-8 sm:p-10 max-w-105 w-full flex flex-col items-center text-center shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && variant !== "processing-payment" && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-neutral-secondary hover:text-text-dark transition-colors focus:outline-none cursor-pointer p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}

        <div className="mt-4 relative flex items-center justify-center">
          {renderIcon()}
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-primary mt-6 tracking-tight">
          {modalTitle}
        </h2>

        <p className="text-neutral-secondary text-xs sm:text-[14px] leading-relaxed mt-2 font-normal max-w-75">
          {modalDescription}
        </p>

        {modalActionLabel && (onAction || onClose) && (
          <Button
            onClick={onAction || onClose}
            variant="amber"
            size="lg"
            className="w-full h-12.5 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] mt-8 transition-all shadow-sm cursor-pointer rounded-xl"
          >
            {modalActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
