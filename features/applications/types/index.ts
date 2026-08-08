import { ButtonProps } from "@/src/components/ui/button";

export type ApplicationFormState =
  | "figma_screen_1"
  | "figma_screen_2"
  | "figma_screen_3"
  | "figma_screen_4"
  | "figma_screen_5"
  | "figma_completed_no_events"
  | "figma_completed_with_events"
  | "figma_awaiting_signature"
  | "figma_internal_verifier_attention"
  | "figma_internal_verifier_completed"
  | "figma_internal_verifier_under_review"
  | "figma_external_verifier_under_review"
  | "figma_certification_competent"
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

export interface Assessor {
  id: string;
  name: string;
  avatar: string | any;
  role: string;
  tags: string[];
  isHighlighted?: boolean;
}

export interface FormItem {
  id: string;
  title: string;
  description?: string;
  signed?: boolean;
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
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  assessors?: Assessor[];
  inconclusiveBanner?: {
    title: string;
    description: string;
    onAppeal?: () => void;
    onTakeCourse?: () => void;
  } | null;
  formsBannerMessage?: string | null;
  formsToSign?: FormItem[];
  onOpenSignatureModal?: (formId: string) => void;
  competentBanner?: {
    title: string;
    subtitle: string;
    description: string;
  } | null;
}

export interface FolderStatus {
  text: string;
  bg: string;
  textColor: string;
}
