import { FacilitatorData } from "@/features/dashboard/components/FacilitatorCard";
import { ButtonProps } from "@/components/ui/button";

export type ApplicationFormState =
  | "pending"
  | "attention"
  | "approved"
  | "vault_active"
  | "vault_3days"
  | "vault_ongoing"
  | "vault_delayed";

export type PaymentStatus = "not_started" | "completed";

export interface ApplicationDetailsPageProps {
  id?: string;
}

export interface StageConfig {
  id: string;
  title: string;
  status: string;
  statusBg: string;
  statusText: string;
  subtext: string;
  actionText?: React.ReactNode;
  actionVariant?: ButtonProps["variant"];
  actionSize?: ButtonProps["size"];
  actionLeftIcon?: React.ReactNode;
  actionRightIcon?: React.ReactNode;
  actionLoading?: boolean;
  alertMessage?: string | null;
  delayedMessage?: string | null;
  showPaymentDetails?: boolean;
  onActionClick?: () => void;
}

export interface FolderStatus {
  text: string;
  bg: string;
  textColor: string;
}
