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
import { setAssessorDetails } from "@/src/store/slices/onboardingSlice";
import { ASSESSOR_ROUTES } from "@/src/features/assessor/utils/assessorRoutes";
import { useAssessorOnboarding } from "../hooks/useOnboarding";

const QUALIFICATION_OPTIONS = [
  "NSQ Level 3 - Assessor Certificate",
  "NSQ Level 4 - Internal Quality Manager (IQM)",
  "QAA Competency Assessor Certificate",
  "TVET Master Assessor",
];

export const AssessorInformation: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const uploadFileMutation = useUploadFile();
  const { getOnboarding, saveOnboarding } = useAssessorOnboarding();
  const saved = useAppSelector((s) => s.onboarding.assessorDetails);

  const [form, setForm] = useState({
    assessorId: saved.assessorId || "",
    qualification: saved.qualifications?.[0] || "",
  });

  const [qaaFile, setQaaFile] = useState<{
    name: string;
    size: string;
    assetId: string;
  } | null>(
    saved.qaaCertificateAssetId
      ? {
          name: saved.qaaCertificateName || "QAA Certificate",
          size: saved.qaaCertificateSize || "5 mb",
          assetId: saved.qaaCertificateAssetId,
        }
      : null,
  );

  const [iqmFile, setIqmFile] = useState<{
    name: string;
    size: string;
    assetId: string;
  } | null>(
    saved.iqmCertificateAssetId
      ? {
          name: saved.iqmCertificateName || "IQM Certificate",
          size: saved.iqmCertificateSize || "5 mb",
          assetId: saved.iqmCertificateAssetId,
        }
      : null,
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(setSidebarVariant("default"));
  }, [dispatch]);

  // Hydrate from API
  useEffect(() => {
    if (getOnboarding.data?.data) {
      const d = (getOnboarding.data.data as any)?.assessorInformation || {};
      setForm((prev) => {
        const next = {
          assessorId: d.assessorId || prev.assessorId,
          qualification: d.qualifications?.[0] || prev.qualification,
        };
        dispatch(setAssessorDetails(next));
        return next;
      });
    }
  }, [getOnboarding.data, dispatch]);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      dispatch(setAssessorDetails({ [field]: value, qualifications: [next.qualification] }));
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCertificateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "qaa" | "iqm",
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMb = `${(file.size / (1024 * 1024)).toFixed(1)} mb`;

      try {
        const asset = await uploadFileMutation.mutateAsync({
          file,
          purpose: "certificate",
        });

        const fileData = {
          name: file.name,
          size: sizeMb,
          assetId: asset?.assetId || `asset-${Date.now()}`,
        };

        if (type === "qaa") {
          setQaaFile(fileData);
          dispatch(
            setAssessorDetails({
              qaaCertificateAssetId: fileData.assetId,
              qaaCertificateName: fileData.name,
              qaaCertificateSize: fileData.size,
            }),
          );
          setErrors((prev) => ({ ...prev, qaa: "" }));
        } else {
          setIqmFile(fileData);
          dispatch(
            setAssessorDetails({
              iqmCertificateAssetId: fileData.assetId,
              iqmCertificateName: fileData.name,
              iqmCertificateSize: fileData.size,
            }),
          );
          setErrors((prev) => ({ ...prev, iqm: "" }));
        }
      } catch {
        toast({
          type: "error",
          title: "Upload Failed",
          description: `Failed to upload ${type.toUpperCase()} Certificate.`,
        });
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
    if (!qaaFile) {
      newErrors.qaa = "QAA Certificate is required";
      valid = false;
    }
    if (!iqmFile) {
      newErrors.iqm = "IQM Certificate is required";
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
        description: "Please complete all required fields and upload certificates.",
      });
      return;
    }

    setIsSubmitting(true);
    saveOnboarding.mutate(
      {
        assessorInformation: {
          assessorId: form.assessorId,
          qualifications: [form.qualification],
          qaaCertificateAssetId: qaaFile?.assetId,
          iqmCertificateAssetId: iqmFile?.assetId,
        },
      },
      {
        onSettled: () => {
          setIsSubmitting(false);
          router.push(ASSESSOR_ROUTES.onboarding.verifyIdentity);
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
            placeholder="Multi-Select"
            value={form.qualification}
            onChange={(e) => update("qualification", e.target.value)}
            options={QUALIFICATION_OPTIONS}
            error={errors.qualification}
          />
        </div>

        {/* Upload Certificate Section */}
        <div className="pt-2">
          <h2 className="text-xl font-extrabold text-neutral-primary mb-4">
            Upload Certificate
          </h2>

          {/* QAA Certificate Upload */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-neutral-primary mb-1.5">
              QAA Certificate<span className="text-primary-solid ml-0.5">*</span>
            </label>

            <label
              className={`w-full min-h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                errors.qaa
                  ? "border-red-500 bg-red-50/50"
                  : "border-red-300 bg-red-50/20 hover:bg-red-50/40"
              }`}
            >
              <input
                type="file"
                accept=".jpg,.png,.pdf,.doc,.docx,.mp4,.webp"
                className="hidden"
                onChange={(e) => handleCertificateUpload(e, "qaa")}
              />
              <FiUpload className="w-5 h-5 text-primary-solid mb-1.5" />
              <span className="font-bold text-xs text-primary-solid">
                Upload Certificate
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                JPG, PNG, PDF, Docs, Mp4, or WebP
              </span>
            </label>
            {errors.qaa && (
              <span className="text-primary-solid text-xs font-semibold mt-1 block">
                {errors.qaa}
              </span>
            )}

            {/* QAA File Completed Item */}
            {qaaFile && (
              <div className="mt-3 w-full border border-gray-200 bg-white rounded-xl p-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-primary-solid">
                    <FaFilePdf className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-primary">
                      {qaaFile.name}
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                      {qaaFile.size}
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <FiCheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQaaFile(null);
                    dispatch(
                      setAssessorDetails({
                        qaaCertificateAssetId: "",
                        qaaCertificateName: "",
                        qaaCertificateSize: "",
                      }),
                    );
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <FiTrash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </div>

          {/* IQM Certificate Upload */}
          <div className="mb-2">
            <label className="block text-sm font-semibold text-neutral-primary mb-1.5">
              IQM Certificate<span className="text-primary-solid ml-0.5">*</span>
            </label>

            <label
              className={`w-full min-h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                errors.iqm
                  ? "border-red-500 bg-red-50/50"
                  : "border-red-300 bg-red-50/20 hover:bg-red-50/40"
              }`}
            >
              <input
                type="file"
                accept=".jpg,.png,.pdf,.doc,.docx,.mp4,.webp"
                className="hidden"
                onChange={(e) => handleCertificateUpload(e, "iqm")}
              />
              <FiUpload className="w-5 h-5 text-primary-solid mb-1.5" />
              <span className="font-bold text-xs text-primary-solid">
                Upload Certificate
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                JPG, PNG, PDF, Docs, Mp4, or WebP
              </span>
            </label>
            {errors.iqm && (
              <span className="text-primary-solid text-xs font-semibold mt-1 block">
                {errors.iqm}
              </span>
            )}

            {/* IQM File Completed Item */}
            {iqmFile && (
              <div className="mt-3 w-full border border-gray-200 bg-white rounded-xl p-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-primary-solid">
                    <FaFilePdf className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-primary">
                      {iqmFile.name}
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                      {iqmFile.size}
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <FiCheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIqmFile(null);
                    dispatch(
                      setAssessorDetails({
                        iqmCertificateAssetId: "",
                        iqmCertificateName: "",
                        iqmCertificateSize: "",
                      }),
                    );
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <FiTrash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </div>
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
