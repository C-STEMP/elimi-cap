"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiUpload, FiTrash2, FiCheckCircle } from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setSidebarVariant } from "@/src/store/slices/authSlice";
import {
  setAssessorDetails,
  type AssessorDetailsState,
} from "@/src/store/slices/onboardingSlice";
import { SelectOption } from "@/src/components/ui/select";
import { ASSESSOR_ROUTES } from "@/src/features/assessor/utils/assessorRoutes";
import { useAssessorOnboarding } from "../hooks/useOnboarding";

export const QUALIFICATION_OPTIONS: SelectOption[] = [
  { value: "QAA", label: "QAA - Quality Assurance Assessor" },
  { value: "IQM", label: "IQM - Internal Quality Manager" },
  { value: "IV", label: "IV - Internal Verifier" },
  { value: "EV", label: "EV - External Verifier" },
];

type UploadKind = "qaa" | "iqm" | "rpl" | "resume";

type UploadedFile = { name: string; size: string; assetId: string };

const UPLOAD_KINDS: UploadKind[] = ["qaa", "iqm", "rpl", "resume"];

const UPLOAD_LABELS: Record<UploadKind, string> = {
  qaa: "QAA Certificate",
  iqm: "IQM Certificate",
  rpl: "RPL Assessor Certificate",
  resume: "CV / Resume",
};

const SLICE_KEYS: Record<
  UploadKind,
  {
    assetId: keyof AssessorDetailsState;
    name: keyof AssessorDetailsState;
    size: keyof AssessorDetailsState;
  }
> = {
  qaa: {
    assetId: "qaaCertificateAssetId",
    name: "qaaCertificateName",
    size: "qaaCertificateSize",
  },
  iqm: {
    assetId: "iqmCertificateAssetId",
    name: "iqmCertificateName",
    size: "iqmCertificateSize",
  },
  rpl: {
    assetId: "rplCertificateAssetId",
    name: "rplCertificateName",
    size: "rplCertificateSize",
  },
  resume: {
    assetId: "resumeAssetId",
    name: "resumeName",
    size: "resumeSize",
  },
};

interface CertificateUploadFieldProps {
  label: string;
  hint: string;
  buttonText?: string;
  accept?: string;
  acceptText?: string;
  file: UploadedFile | null;
  highlightError?: boolean;
  error?: string;
  uploading: boolean;
  anyUploading: boolean;
  uploadingFileName: string;
  uploadProgress: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const CertificateUploadField: React.FC<CertificateUploadFieldProps> = ({
  label,
  hint,
  buttonText = "Upload Certificate",
  accept = ".jpg,.png,.pdf,.doc,.docx,.mp4,.webp",
  acceptText = "JPG, PNG, PDF, Docs, Mp4, or WebP",
  file,
  highlightError,
  error,
  uploading,
  anyUploading,
  uploadingFileName,
  uploadProgress,
  onChange,
  onRemove,
}) => (
  <div className="mb-5">
    <label className="block text-sm font-semibold text-neutral-primary mb-1.5">
      {label}{" "}
      <span className="text-xs font-normal text-neutral-secondary">{hint}</span>
    </label>

    <label
      className={`w-full min-h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
        highlightError
          ? "border-red-500 bg-red-50/50"
          : "border-red-300 bg-red-50/20 hover:bg-red-50/40"
      }`}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={uploading}
        onChange={onChange}
      />
      <FiUpload className="w-5 h-5 text-primary-solid mb-1.5" />
      <span className="font-bold text-xs text-primary-solid">{buttonText}</span>
      <span className="text-[10px] text-gray-400 mt-0.5">{acceptText}</span>
    </label>
    {error && (
      <span className="text-primary-solid text-xs font-semibold mt-1 block">
        {error}
      </span>
    )}

    {uploading && (
      <div className="mt-3 w-full border border-primary-solid/20 bg-primary-solid/5 rounded-xl p-3 flex flex-col gap-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-4 h-4 border-2 border-primary-solid border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-xs font-semibold text-neutral-primary truncate">
              Uploading {uploadingFileName || label}...
            </span>
          </div>
          <span className="text-xs font-bold text-primary-solid shrink-0">
            {uploadProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary-solid h-full rounded-full transition-all duration-200 ease-out"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      </div>
    )}

    {file && !anyUploading && (
      <div className="mt-3 w-full border border-gray-200 bg-white rounded-xl p-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-primary-solid shrink-0">
            <FaFilePdf className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-neutral-primary truncate">
              {file.name}
            </span>
            <span className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
              {file.size}
              <span>•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <FiCheckCircle className="w-3.5 h-3.5" /> Completed
              </span>
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <FiTrash2 className="w-4.5 h-4.5" />
        </button>
      </div>
    )}
  </div>
);

export const AssessorInformation: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const uploadFileMutation = useUploadFile();
  const { getOnboarding, saveOnboarding } = useAssessorOnboarding();
  const saved = useAppSelector((s) => s.onboarding.assessorDetails);

  const [form, setForm] = useState({
    assessorId: saved.assessorId || "",
    qualification:
      saved.qualification ||
      (Array.isArray(saved.qualifications) ? saved.qualifications[0] : "") ||
      "QAA",
  });

  const [files, setFiles] = useState<Record<UploadKind, UploadedFile | null>>(
    () =>
      Object.fromEntries(
        UPLOAD_KINDS.map((kind) => {
          const keys = SLICE_KEYS[kind];
          const assetId = saved[keys.assetId];
          return [
            kind,
            assetId
              ? {
                  name: saved[keys.name] || UPLOAD_LABELS[kind],
                  size: saved[keys.size] || "5 mb",
                  assetId,
                }
              : null,
          ];
        }),
      ) as Record<UploadKind, UploadedFile | null>,
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingType, setUploadingType] = useState<UploadKind | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingFileName, setUploadingFileName] = useState<string>("");

  useEffect(() => {
    dispatch(setSidebarVariant("default"));
  }, [dispatch]);

  // Hydrate from API
  useEffect(() => {
    if (getOnboarding.data?.data) {
      const d = (getOnboarding.data.data as any)?.assessorDetails || {};
      const next = {
        assessorId: d.assessorNo || form.assessorId,
        qualification:
          d.qualification ||
          (Array.isArray(d.qualifications) ? d.qualifications[0] : "") ||
          form.qualification ||
          "QAA",
      };
      setForm(next);
      dispatch(setAssessorDetails(next));
    }
  }, [getOnboarding.data, dispatch]);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    dispatch(
      setAssessorDetails({
        [field]: value,
        qualification: field === "qualification" ? value : form.qualification,
        qualifications: field === "qualification" ? [value] : [form.qualification],
      }),
    );
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const setFile = (kind: UploadKind, file: UploadedFile | null) => {
    setFiles((prev) => ({ ...prev, [kind]: file }));
    const keys = SLICE_KEYS[kind];
    dispatch(
      setAssessorDetails({
        [keys.assetId]: file?.assetId ?? "",
        [keys.name]: file?.name ?? "",
        [keys.size]: file?.size ?? "",
      }),
    );
  };

  const handleCertificateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: UploadKind,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      e.target.value = "";
      const sizeMb = `${(file.size / (1024 * 1024)).toFixed(1)} mb`;

      setUploadingType(type);
      setUploadingFileName(file.name);
      setUploadProgress(20);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 180);

      try {
        const asset = await uploadFileMutation.mutateAsync({
          file,
          purpose: "certificate",
        });

        clearInterval(progressInterval);
        if (!asset?.assetId) {
          throw new Error("The upload did not return an asset id.");
        }
        setUploadProgress(100);

        setFile(type, { name: file.name, size: sizeMb, assetId: asset.assetId });
        setErrors((prev) => ({ ...prev, [type]: "", certificates: "" }));
      } catch {
        clearInterval(progressInterval);
        toast({
          type: "error",
          title: "Upload Failed",
          description: `Failed to upload ${UPLOAD_LABELS[type]}.`,
        });
      } finally {
        setUploadingType(null);
        setUploadProgress(0);
        setUploadingFileName("");
      }
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (!form.assessorId.trim()) {
      newErrors.assessorId = "Assessor ID is required";
      valid = false;
    }
    if (!form.qualification) {
      newErrors.qualification = "Qualification is required";
      valid = false;
    }
    // RPL certificate and CV are supporting documents only — the backend
    // still requires at least one of ev/qaa/iqm on submit.
    if (!files.qaa && !files.iqm) {
      newErrors.certificates =
        "Please upload at least one qualification certificate (QAA or IQM)";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        type: "error",
        title: "Input Required",
        description:
          "Please complete all required fields and upload at least one certificate.",
      });
      return;
    }

    setIsSubmitting(true);
    saveOnboarding.mutate(
      {
        assessorDetails: {
          assessorNo: form.assessorId,
          ...(files.resume ? { resumeAssetId: files.resume.assetId } : {}),
          certifications: {
            ...(files.qaa ? { qaa: { certificateAssetId: files.qaa.assetId } } : {}),
            ...(files.iqm ? { iqm: { certificateAssetId: files.iqm.assetId } } : {}),
            ...(files.rpl ? { rpl: { certificateAssetId: files.rpl.assetId } } : {}),
          },
        },
      },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          router.push(ASSESSOR_ROUTES.onboarding.verifyIdentity);
        },
        onError: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        {/* Progress Bar */}
        <div className="w-full max-w-109.75 flex justify-start mb-2">
          <div className="w-46.5 h-2.5 bg-primary-solid/15 rounded-[10px] overflow-hidden">
            <div className="w-2/3 h-full bg-primary-solid rounded-[10px] transition-all duration-300" />
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
            Assessor Information
          </h1>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal">
            Collect only essential information.
          </p>
        </div>

        {/* Assessor Information Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={<span>Assessor ID<span className="text-primary-solid ml-0.5">*</span></span>}
            placeholder="First name"
            value={form.assessorId}
            onChange={(e) => update("assessorId", e.target.value)}
            error={errors.assessorId}
          />
          <Select
            label={<span>Qualification<span className="text-primary-solid ml-0.5">*</span></span>}
            placeholder="Select Qualification"
            value={form.qualification}
            onChange={(e) => update("qualification", e.target.value)}
            options={QUALIFICATION_OPTIONS}
            error={errors.qualification}
          />
        </div>

        {/* Upload Certificate Section */}
        <div className="pt-2">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-neutral-primary">
              Upload Certificate<span className="text-primary-solid ml-0.5">*</span>
            </h2>
            <p className="text-xs text-neutral-secondary mt-0.5">
              Please upload at least one qualification certificate (QAA or IQM).
              Your RPL assessor certificate and CV are optional.
            </p>
            {errors.certificates && (
              <p className="text-red-600 text-xs font-semibold mt-2 bg-red-50 border border-red-200 rounded-xl p-2.5">
                {errors.certificates}
              </p>
            )}
          </div>

          <CertificateUploadField
            label="QAA Certificate"
            hint="(Optional if IQM is uploaded)"
            file={files.qaa}
            highlightError={!!errors.qaa || (!!errors.certificates && !files.qaa)}
            error={errors.qaa}
            uploading={uploadingType === "qaa"}
            uploadingFileName={uploadingFileName}
            uploadProgress={uploadProgress}
            anyUploading={!!uploadingType}
            onChange={(e) => handleCertificateUpload(e, "qaa")}
            onRemove={() => setFile("qaa", null)}
          />

          <CertificateUploadField
            label="IQM Certificate"
            hint="(Optional if QAA is uploaded)"
            file={files.iqm}
            highlightError={!!errors.iqm || (!!errors.certificates && !files.iqm)}
            error={errors.iqm}
            uploading={uploadingType === "iqm"}
            uploadingFileName={uploadingFileName}
            uploadProgress={uploadProgress}
            anyUploading={!!uploadingType}
            onChange={(e) => handleCertificateUpload(e, "iqm")}
            onRemove={() => setFile("iqm", null)}
          />

          <CertificateUploadField
            label="RPL Assessor Certificate"
            hint="(Optional)"
            file={files.rpl}
            error={errors.rpl}
            uploading={uploadingType === "rpl"}
            uploadingFileName={uploadingFileName}
            uploadProgress={uploadProgress}
            anyUploading={!!uploadingType}
            onChange={(e) => handleCertificateUpload(e, "rpl")}
            onRemove={() => setFile("rpl", null)}
          />

          <CertificateUploadField
            label="CV / Resume"
            hint="(Optional)"
            buttonText="Upload CV"
            accept=".pdf,.doc,.docx"
            acceptText="PDF or Docs"
            file={files.resume}
            error={errors.resume}
            uploading={uploadingType === "resume"}
            uploadingFileName={uploadingFileName}
            uploadProgress={uploadProgress}
            anyUploading={!!uploadingType}
            onChange={(e) => handleCertificateUpload(e, "resume")}
            onRemove={() => setFile("resume", null)}
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push(ASSESSOR_ROUTES.onboarding.personalInfo)}
            className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Button
            type="submit"
            variant="amber"
            size="md"
            loading={isSubmitting}
            rightIcon={<FiArrowRight className="w-4 h-4" />}
            className="px-8 h-11 font-bold text-sm rounded-xl shadow-lg cursor-pointer"
          >
            Verify Identity
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
