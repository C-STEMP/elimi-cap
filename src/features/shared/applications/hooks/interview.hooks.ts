import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  getInterviewPanelApi,
  getInterviewScheduleApi,
  evaluateInterviewApi,
  getInterviewFormsApi,
  updateInterviewFormApi,
  signoffInterviewFormApi,
  getInterviewObserverCommentsApi,
  postInterviewObserverCommentApi,
} from "../api";
import { APPLICATION_QUERY_KEYS } from "./queryKeys";

export function useGetInterviewPanel(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["applications", "interview-panel", id],
    queryFn: () => getInterviewPanelApi(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetInterviewSchedule(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["applications", "interview-schedule", id],
    queryFn: () => getInterviewScheduleApi(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEvaluateInterview(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: {
      feedback: string;
      signatureAssetId: string;
      decision?: "approve" | "reject";
      outcome?: "unsuccessful" | "inconclusive";
    }) => evaluateInterviewApi(id, payload),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.stages(id),
      });
      queryClient.invalidateQueries({
        queryKey: ["applications", "interview-forms", id],
      });
      toast({
        type: "success",
        title: "Evaluation Submitted",
        description:
          data?.message ||
          "Your interview evaluation has been recorded successfully.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Evaluation Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to submit evaluation. Please try again.",
        });
      }
    },
  });
}

export function useGetInterviewForms(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["applications", "interview-forms", id],
    queryFn: () => getInterviewFormsApi(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateInterviewForm(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      formType,
      data,
    }: {
      formType:
        | "records"
        | "assessment_grid"
        | "practical_observation"
        | "skill_demonstration";
      data: Record<string, unknown>;
    }) => updateInterviewFormApi(id, formType, { data }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "interview-forms", id],
      });
      toast({
        type: "success",
        title: "Form Saved",
        description: "Interview assessment form updated successfully.",
      });
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
          description: "Unable to save interview form. Please try again.",
        });
      }
    },
  });
}

export function useSignoffInterviewForm(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      formType,
      payload,
    }: {
      formType:
        | "records"
        | "assessment_grid"
        | "practical_observation"
        | "skill_demonstration";
      payload: {
        signatureMode: "upload" | "default" | "typed";
        signatureAssetId?: string;
        typedName?: string;
      };
    }) => signoffInterviewFormApi(id, formType, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "interview-forms", id],
      });
      toast({
        type: "success",
        title: "Form Signed",
        description: "Form signed off successfully.",
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
          description: "Unable to sign form. Please try again.",
        });
      }
    },
  });
}

export function useGetInterviewObserverComments(id: string) {
  return useQuery({
    queryKey: ["applications", "interview-observer-comments", id],
    queryFn: () => getInterviewObserverCommentsApi(id),
    enabled: Boolean(id),
  });
}

export function usePostInterviewObserverComment(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (content: string) =>
      postInterviewObserverCommentApi(id, content),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "interview-observer-comments", id],
      });
      toast({
        type: "success",
        title: "Comment Posted",
        description: "Observer comment recorded.",
      });
    },

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Comment Failed",
          description: error.message,
        });
      } else {
        toast({
          type: "error",
          title: "Network Error",
          description: "Unable to post comment. Please try again.",
        });
      }
    },
  });
}
