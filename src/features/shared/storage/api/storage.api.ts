import { createApiInstance, unwrap } from "@/src/lib/api/client";

const orchestratorClient = createApiInstance(
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || "",
);

export interface StorageAssetMetadata {
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
}

export interface StorageAsset {
  assetId: string;
  url: string;
  provider: string;
  type: string;
  metadata?: StorageAssetMetadata;
}

export interface UploadUrlRequest {
  fileName: string;
  mimeType: string;
  purpose?: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  assetId: string;
  expiresAt: string;
}

export async function uploadSingleFileApi(
  file: File,
  purpose?: string,
): Promise<StorageAsset> {
  const formData = new FormData();
  formData.append("file", file);
  if (purpose) {
    formData.append("purpose", purpose);
  }

  return unwrap<StorageAsset>(
    orchestratorClient.post("/storage/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  );
}

export async function uploadMultipleFilesApi(
  files: File[],
  purpose?: string,
): Promise<StorageAsset[]> {
  const uploadPromises = files.map((file) => uploadSingleFileApi(file, purpose));
  return Promise.all(uploadPromises);
}

export async function getUploadUrlApi(
  payload: UploadUrlRequest,
): Promise<UploadUrlResponse> {
  return unwrap<UploadUrlResponse>(
    orchestratorClient.post("/storage/upload-url", payload),
  );
}

export async function confirmUploadApi(
  assetId: string,
): Promise<StorageAsset> {
  return unwrap<StorageAsset>(
    orchestratorClient.post("/storage/confirm", { assetId }),
  );
}

export async function resolveAssetsApi(
  assetIds: string[],
): Promise<{ assetId: string; url: string }[]> {
  return unwrap<{ assetId: string; url: string }[]>(
    orchestratorClient.post("/storage/resolve", { assetIds }),
  );
}

export async function deleteAssetApi(assetId: string): Promise<void> {
  await unwrap<void>(
    orchestratorClient.delete(`/storage/${assetId}`),
  );
}
