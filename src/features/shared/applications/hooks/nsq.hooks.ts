import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getSelfAssessmentApi,
  saveSelfAssessmentApi,
  submitInductionFormApi,
  scheduleDirectObservationApi,
  submitUnitEvidenceApi,
  submitUnitSignoffApi,
  assignUnitAssessorApi,
  type SaveSelfAssessmentPayload,
  type PostUnitEvidencePayload,
  type PostUnitSignoffPayload,
} from "../api";
import { APPLICATION_QUERY_KEYS } from "./queryKeys";

export function useGetSelfAssessment(applicationId: string) {
  return useQuery({
    queryKey: APPLICATION_QUERY_KEYS.selfAssessment(applicationId),
    queryFn: () => getSelfAssessmentApi(applicationId),
    enabled: Boolean(applicationId),
  });
}

export function useSaveSelfAssessment(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: SaveSelfAssessmentPayload) =>
      saveSelfAssessmentApi(applicationId, payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.selfAssessment(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.all,
      });
      if (data?.submittedAt) {
        toast({
          type: "success",
          title: "Self-Assessment Submitted",
          description: "Your self-assessment has been successfully submitted.",
        });
      } else {
        toast({
          type: "success",
          title: "Draft Saved",
          description: "Your self-assessment draft has been saved.",
        });
      }
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Save Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to save self-assessment. Please try again.",
        });
      }
    },
  });
}

export function useSubmitInductionForm(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      submitInductionFormApi(applicationId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      toast({
        type: "success",
        title: "Induction Form Submitted",
        description: "Your induction form has been recorded successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Submission Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to submit induction form. Please try again.",
        });
      }
    },
  });
}

export function useScheduleDirectObservation(applicationId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (scheduledAt: string) =>
      scheduleDirectObservationApi(applicationId, scheduledAt),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      toast({
        type: "success",
        title: "Observation Scheduled",
        description: "Direct observation session scheduled successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Scheduling Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to schedule observation. Please try again.",
        });
      }
    },
  });
}

export function useSubmitUnitEvidence(applicationId: string, unitId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: PostUnitEvidencePayload) =>
      submitUnitEvidenceApi(applicationId, unitId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      toast({
        type: "success",
        title: "Evidence Recorded",
        description: "Performance criteria evidence recorded successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Upload Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to submit unit evidence. Please try again.",
        });
      }
    },
  });
}

export function useSubmitUnitSignoff(applicationId: string, unitId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: PostUnitSignoffPayload) =>
      submitUnitSignoffApi(applicationId, unitId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      toast({
        type: "success",
        title: "Unit Signed Off",
        description: "Unit sign-off recorded successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Sign-off Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to record unit sign-off. Please try again.",
        });
      }
    },
  });
}

export function useAssignUnitAssessor(applicationId: string, unitId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assessorId: string) =>
      assignUnitAssessorApi(applicationId, unitId, assessorId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      });
      toast({
        type: "success",
        title: "Unit Assessor Assigned",
        description: "QAA unit assessor assigned successfully.",
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
          description: "Unable to assign unit assessor. Please try again.",
        });
      }
    },
  });
}
