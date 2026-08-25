import {
  useCreateApplication as useSharedCreateApplication,
  usePatchApplicationDraft as useSharedPatchApplicationDraft,
  useGetApplications as useSharedGetApplications,
  useGetApplicationById as useSharedGetApplicationById,
  useSubmitApplication as useSharedSubmitApplication,
  useGetApplicationStages as useSharedGetApplicationStages,
  useInitiateApplicationPayment as useSharedInitiateApplicationPayment,
  useGetApplicationReceipt as useSharedGetApplicationReceipt,
  useGetPaymentQuote as useSharedGetPaymentQuote,
} from "@/src/features/shared/applications/hooks";
import type { ApplicationStatus } from "../api/application.api";

export function useCreateApplication() {
  return useSharedCreateApplication();
}

export function usePatchApplicationDraft() {
  return useSharedPatchApplicationDraft();
}

export function useGetApplications(status?: ApplicationStatus) {
  return useSharedGetApplications(status);
}

export function useGetApplicationById(id: string) {
  return useSharedGetApplicationById(id);
}

export function useSubmitApplication() {
  return useSharedSubmitApplication();
}

export function useGetApplicationStages(id: string) {
  return useSharedGetApplicationStages(id);
}

export function useInitiateApplicationPayment() {
  return useSharedInitiateApplicationPayment();
}

export function useGetPaymentQuote(id: string) {
  return useSharedGetPaymentQuote(id);
}

export function useGetApplicationReceipt(id: string) {
  return useSharedGetApplicationReceipt(id);
}

/**
 * Composite hook for Candidate Application operations
 */
export function useApplication() {
  const createApplication = useCreateApplication();
  const submitApplication = useSubmitApplication();
  const initiatePayment = useInitiateApplicationPayment();

  return {
    createApplication,
    submitApplication,
    initiatePayment,
  };
}
