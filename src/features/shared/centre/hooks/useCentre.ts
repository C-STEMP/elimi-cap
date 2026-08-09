import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getCentreStaffApi,
  addCentreStaffApi,
  getCentreJobPostingsApi,
  createCentreJobPostingApi,
  getCentreRetainedRequestsApi,
  approveRetainedRequestApi,
  rejectRetainedRequestApi,
  getCentrePricingApi,
  setCentrePricingApi,
  getCentreWalletApi,
  withdrawCentreWalletApi,
  type AddCentreStaffPayload,
  type CreateJobPostingPayload,
  type RetainedRequestStatus,
  type SetCentrePricingPayload,
  type WithdrawPayload,
} from "../api/centre.api";

export const CENTRE_QUERY_KEYS = {
  staff: ["centre", "staff"] as const,
  jobPostings: ["centre", "job-postings"] as const,
  retainedRequests: (status?: RetainedRequestStatus) =>
    ["centre", "retained-requests", status] as const,
  pricing: ["centre", "pricing"] as const,
  wallet: ["centre", "wallet"] as const,
};

export function useGetCentreStaff() {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.staff,
    queryFn: () => getCentreStaffApi(),
  });
}

export function useAddCentreStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: AddCentreStaffPayload) => addCentreStaffApi(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.staff });
      toast({
        type: "success",
        title: "Staff Added",
        description: "New centre staff member added successfully.",
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
          description: "Unable to add staff member. Please try again.",
        });
      }
    },
  });
}

export function useGetJobPostings() {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.jobPostings,
    queryFn: () => getCentreJobPostingsApi(),
  });
}

export function useCreateJobPosting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateJobPostingPayload) =>
      createCentreJobPostingApi(payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.jobPostings });
      toast({
        type: "success",
        title: "Job Posting Published",
        description: `Job posting "${data.title}" published successfully.`,
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Job Posting Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to publish job posting. Please try again.",
        });
      }
    },
  });
}

export function useGetRetainedRequests(status?: RetainedRequestStatus) {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.retainedRequests(status),
    queryFn: () => getCentreRetainedRequestsApi(status),
  });
}

export function useApproveRetainedRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => approveRetainedRequestApi(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["centre", "retained-requests"],
      });
      toast({
        type: "success",
        title: "Request Approved",
        description: "Retained assessor request approved.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Approval Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to approve request. Please try again.",
        });
      }
    },
  });
}

export function useRejectRetainedRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => rejectRetainedRequestApi(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["centre", "retained-requests"],
      });
      toast({
        type: "success",
        title: "Request Rejected",
        description: "Retained assessor request rejected.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Rejection Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to reject request. Please try again.",
        });
      }
    },
  });
}

export function useGetCentrePricing() {
  return useQuery({
    queryKey: CENTRE_QUERY_KEYS.pricing,
    queryFn: () => getCentrePricingApi(),
  });
}

export function useSetCentrePricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: SetCentrePricingPayload) =>
      setCentrePricingApi(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.pricing });
      toast({
        type: "success",
        title: "Pricing Updated",
        description: "Centre pricing updated successfully.",
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
    queryKey: CENTRE_QUERY_KEYS.wallet,
    queryFn: () => getCentreWalletApi(),
  });
}

export function useWithdrawCentreWallet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: WithdrawPayload) => withdrawCentreWalletApi(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CENTRE_QUERY_KEYS.wallet });
      toast({
        type: "success",
        title: "Withdrawal Requested",
        description: "Withdrawal request submitted successfully.",
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

export function useCentre() {
  const addStaff = useAddCentreStaff();
  const createJobPosting = useCreateJobPosting();
  const approveRetainedRequest = useApproveRetainedRequest();
  const rejectRetainedRequest = useRejectRetainedRequest();
  const setPricing = useSetCentrePricing();
  const withdrawWallet = useWithdrawCentreWallet();

  return {
    addStaff,
    createJobPosting,
    approveRetainedRequest,
    rejectRetainedRequest,
    setPricing,
    withdrawWallet,
  };
}
