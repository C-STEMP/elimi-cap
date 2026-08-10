import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { ApiError } from "@/src/lib/api/client";
import {
  uploadSingleFileApi,
  uploadMultipleFilesApi,
  resolveAssetsApi,
  deleteAssetApi,
} from "../api/storage.api";

export const STORAGE_QUERY_KEYS = {
  assets: (assetIds: string[]) => ["storage", "resolve", assetIds] as const,
};

export function useUploadFile() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, purpose }: { file: File; purpose?: string }) =>
      uploadSingleFileApi(file, purpose),

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
          description: "Unable to upload image. Please try again.",
        });
      }
    },
  });
}

export function useUploadMultipleFiles() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ files, purpose }: { files: File[]; purpose?: string }) =>
      uploadMultipleFilesApi(files, purpose),

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
          description: "Unable to upload files. Please try again.",
        });
      }
    },
  });
}

export function useResolveAssets(assetIds: string[]) {
  return useQuery({
    queryKey: STORAGE_QUERY_KEYS.assets(assetIds),
    queryFn: () => resolveAssetsApi(assetIds),
    enabled: assetIds.length > 0,
  });
}

export function useDeleteAsset() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (assetId: string) => deleteAssetApi(assetId),

    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast({
          type: "error",
          title: "Delete Failed",
          description: error.message,
        });
      }
    },
  });
}

export function useStorage() {
  const uploadFile = useUploadFile();
  const uploadMultipleFiles = useUploadMultipleFiles();
  const deleteAsset = useDeleteAsset();

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteAsset,
  };
}
