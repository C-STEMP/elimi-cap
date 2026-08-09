import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getCentreApplicationsApi,
  getCentreApplicationByIdApi,
  reviewCentreApplicationApi,
  assignFacilitatorApi,
  assignInternalVerifierApi,
  forwardToAwardingBodyApi,
  getCentreStaffApi,
  addCentreStaffApi,
  getCentrePricingApi,
  setCentrePricingApi,
  getCentreWalletApi,
  withdrawCentreWalletApi,
  type ApplicationStatus,
  type ReviewDecisionPayload,
  type AssignFacilitatorPayload,
  type AssignInternalVerifierPayload,
  type AddCentreStaffPayload,
} from "../api/application.api";

export const CENTRE_APPLICATION_QUERY_KEYS = {
  all: ["centre", "applications"] as const,
  list: (status?: ApplicationStatus) =>
    ["centre", "applications", "list", status] as const,
  detail: (id: string) => ["centre", "applications", "detail", id] as const,
  staff: ["centre", "staff"] as const,
  pricing: ["centre", "pricing"] as const,
  wallet: ["centre", "wallet"] as const,
};

export function useGetApplications(status?: ApplicationStatus) {
  return useQuery({
    queryKey: CENTRE_APPLICATION_QUERY_KEYS.list(status),
    queryFn: () => getCentreApplicationsApi(status),
  });
}

export function useGetApplicationById(id: string) {
  return useQuery({
    queryKey: CENTRE_APPLICATION_QUERY_KEYS.detail(id),
    queryFn: () => getCentreApplicationByIdApi(id),
    enabled: Boolean(id),
  });
}

export function useReviewApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewDecisionPayload;
    }) => reviewCentreApplicationApi(id, payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: CENTRE_APPLICATION_QUERY_KEYS.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: CENTRE_APPLICATION_QUERY_KEYS.all,
      });
      toast({
        type: "success",
        title: "Review Decision Saved",
        description: `Application ${data.id} updated.`,
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Review Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to save review decision. Please try again.",
        });
      }
    },
  });
}

export function useAssignFacilitator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AssignFacilitatorPayload;
    }) => assignFacilitatorApi(id, payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: CENTRE_APPLICATION_QUERY_KEYS.detail(data.id),
      });
      toast({
        type: "success",
        title: "Facilitator Assigned",
        description: "Assessor assigned as facilitator.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Assignment Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to assign facilitator. Please try again.",
        });
      }
    },
  });
}

export function useAssignInternalVerifier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AssignInternalVerifierPayload;
    }) => assignInternalVerifierApi(id, payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: CENTRE_APPLICATION_QUERY_KEYS.detail(data.id),
      });
      toast({
        type: "success",
        title: "Internal Verifier Assigned",
        description: "IV assigned to application.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Assignment Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to assign IV. Please try again.",
        });
      }
    },
  });
}

export function useForwardToAwardingBody() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => forwardToAwardingBodyApi(id),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: CENTRE_APPLICATION_QUERY_KEYS.detail(data.id),
      });
      toast({
        type: "success",
        title: "Forwarded to Awarding Body",
        description: "Application forwarded successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Forwarding Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to forward application. Please try again.",
        });
      }
    },
  });
}

export function useGetCentreStaff() {
  return useQuery({
    queryKey: CENTRE_APPLICATION_QUERY_KEYS.staff,
    queryFn: () => getCentreStaffApi(),
  });
}

export function useAddCentreStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: AddCentreStaffPayload) => addCentreStaffApi(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CENTRE_APPLICATION_QUERY_KEYS.staff,
      });
      toast({
        type: "success",
        title: "Staff Added",
        description: "Centre staff member added successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Failed to Add Staff",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to add staff. Please try again.",
        });
      }
    },
  });
}

export function useGetCentrePricing() {
  return useQuery({
    queryKey: CENTRE_APPLICATION_QUERY_KEYS.pricing,
    queryFn: () => getCentrePricingApi(),
  });
}

export function useSetCentrePricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: {
      applicationType: "RPL" | "NSQ";
      price: { amountMinorUnits: string; currency: string };
    }) => setCentrePricingApi(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CENTRE_APPLICATION_QUERY_KEYS.pricing,
      });
      toast({
        type: "success",
        title: "Pricing Updated",
        description: "Centre application pricing saved.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Pricing Update Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to update pricing. Please try again.",
        });
      }
    },
  });
}

export function useGetCentreWallet() {
  return useQuery({
    queryKey: CENTRE_APPLICATION_QUERY_KEYS.wallet,
    queryFn: () => getCentreWalletApi(),
  });
}

export function useWithdrawCentreWallet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (amount: { amountMinorUnits: string; currency: string }) =>
      withdrawCentreWalletApi({ amount }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CENTRE_APPLICATION_QUERY_KEYS.wallet,
      });
      toast({
        type: "success",
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Withdrawal Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to request withdrawal. Please try again.",
        });
      }
    },
  });
}

/**
 * Composite hook grouping Assessment Centre Application operations
 */
export function useApplication() {
  const reviewApplication = useReviewApplication();
  const assignFacilitator = useAssignFacilitator();
  const assignIV = useAssignInternalVerifier();
  const forwardToAwardingBody = useForwardToAwardingBody();
  const addStaff = useAddCentreStaff();
  const setPricing = useSetCentrePricing();
  const withdrawWallet = useWithdrawCentreWallet();

  return {
    reviewApplication,
    assignFacilitator,
    assignIV,
    forwardToAwardingBody,
    addStaff,
    setPricing,
    withdrawWallet,
  };
}
