"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { DatePicker } from "@/src/components/ui/date-picker";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveIcon } from "@/assets";
import { StatusModal } from "@/components/status-modal";
import { InfoIcon } from "@/src/components/ui/info-icon";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarVariant, setRplStep } from "@/store/slices/authSlice";
import { setRPLExperienceTrade } from "@/store/slices/onboardingSlice";
import { useOnboarding } from "@/src/features/candidate/features/Onboarding/hooks";

import {
  rplExperienceTradeSchema,
  extractZodErrors,
} from "@/src/lib/validation";

export interface RPLExperienceTradeProps {
  onBack?: () => void;
  onContinue?: () => void;
}

const EVIDENCE_OPTIONS = [
  "Resume / CV",
  "Work Samples",
  "Employment Letter",
  "Certificates / Statements of Attainment",
  "Statements of Attainment",
  "References / Third-Party Reports",
  "Job Descriptions",
  "Photos / Videos of Work",
  "Other",
];

const parseDate = (str: string): Date | null => {
  if (!str || typeof str !== "string") return null;
  const parts = str.trim().split(/[/.-]/);
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return null;
};

export const RPLExperienceTrade: React.FC<RPLExperienceTradeProps> = ({
  onBack,
  onContinue,
}) => {
  const dispatch = useAppDispatch();
  const { saveOnboarding } = useOnboarding();
  const savedTrade = useAppSelector((s) => s.onboarding.startApplication.trade);
  const savedRPLExperienceTrade = useAppSelector(
    (s) => s.onboarding.rplExperienceTrade,
  );

  const [form, setForm] = useState({
    // Qualification Applying For
    qualificationTitle:
      savedRPLExperienceTrade.qualificationTitle || savedTrade || "",
    qualificationCode:
      savedRPLExperienceTrade.qualificationCode || "NOS-ELI-L3",
    completedBefore: savedRPLExperienceTrade.completedBefore || "No",
    previousAssessmentDetails:
      savedRPLExperienceTrade.previousAssessmentDetails || "",
    assessmentType: savedRPLExperienceTrade.assessmentType || "",
    individualUnit: savedRPLExperienceTrade.individualUnit || [],

    // Current Occupation
    occupation: savedRPLExperienceTrade.occupation || "",
    yearsOfExperience: savedRPLExperienceTrade.yearsOfExperience || "",

    // Employment History
    employments:
      savedRPLExperienceTrade.employments?.length > 0
        ? savedRPLExperienceTrade.employments
        : [
            {
              id: "1",
              companyName: "",
              jobTitle: "",
              employmentType: "",
              startDate: "",
              endDate: "",
              responsibilities: "",
            },
          ],

    // Why applying for RPL
    reasonRPL: savedRPLExperienceTrade.reasonRPL || "",

    // Evidence Summary
    selectedEvidence: savedRPLExperienceTrade.selectedEvidence || [],
    otherEvidenceText: savedRPLExperienceTrade.otherEvidenceText || "",

    isSubmitting: false,
    showSuccessModal: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      dispatch(
        setRPLExperienceTrade({
          [field]: value,
        }),
      );
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const updateEmployment = (id: string, field: string, value: any) => {
    setForm((prev) => {
      const updatedEmployments = prev.employments.map((emp) =>
        emp.id === id ? { ...emp, [field]: value } : emp,
      );

      const targetEmp = updatedEmployments.find((emp) => emp.id === id);
      if (targetEmp && (field === "startDate" || field === "endDate")) {
        const sVal = targetEmp.startDate;
        const eVal = targetEmp.endDate;
        if (sVal && eVal) {
          const start = parseDate(sVal);
          const end = parseDate(eVal);
          if (start && end && end <= start) {
            setErrors((errs) => ({
              ...errs,
              [`empDate_${id}`]: "End date must be greater than start date",
            }));
          } else {
            setErrors((errs) => ({
              ...errs,
              [`empDate_${id}`]: "",
            }));
          }
        } else {
          setErrors((errs) => ({
            ...errs,
            [`empDate_${id}`]: "",
          }));
        }
      }

      dispatch(setRPLExperienceTrade({ employments: updatedEmployments }));

      return {
        ...prev,
        employments: updatedEmployments,
      };
    });

    if (field !== "startDate" && field !== "endDate" && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addEmployment = () => {
    setForm((prev) => ({
      ...prev,
      employments: [
        ...prev.employments,
        {
          id: Date.now().toString(),
          companyName: "",
          jobTitle: "",
          employmentType: "",
          startDate: "",
          endDate: "",
          responsibilities: "",
        },
      ],
    }));
  };

  const removeEmployment = (id: string) => {
    if (form.employments.length > 1) {
      update(
        "employments",
        form.employments.filter((emp) => emp.id !== id),
      );
    }
  };

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    dispatch(setSidebarVariant("rpl-form"));
    dispatch(setRplStep(2));
  }, [dispatch]);

  const toggleEvidence = (item: string) => {
    const current = form.selectedEvidence;
    if (current.includes(item)) {
      update(
        "selectedEvidence",
        current.filter((i) => i !== item),
      );
    } else {
      update("selectedEvidence", [...current, item]);
    }
  };

  const [showConfirmDraftModal, setShowConfirmDraftModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);

  const handleSaveDraft = () => {
    setShowConfirmDraftModal(true);
  };

  const handleConfirmSaveDraft = () => {
    setShowConfirmDraftModal(false);
    saveOnboarding.mutate(
      {
        accessibility: {
          hasImpairment: false,
          impairment: "",
        },
      },
      {
        onSuccess: () => {
          setShowDraftModal(true);
        },
      },
    );
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    const result = rplExperienceTradeSchema.safeParse(form);
    if (!result.success) {
      Object.assign(newErrors, extractZodErrors(result));
      valid = false;
    }

    // Validate start and end dates
    form.employments.forEach((emp) => {
      if (emp.startDate && emp.endDate) {
        const start = parseDate(emp.startDate);
        const end = parseDate(emp.endDate);
        if (start && end && end <= start) {
          newErrors[`empDate_${emp.id}`] =
            "End date must be greater than start date";
          valid = false;
        }
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        type: "error",
        title: "Input Required",
        description:
          "Please check form errors. End date must be greater than start date.",
      });
      return;
    }

    update("isSubmitting", true);
    setTimeout(() => {
      update("isSubmitting", false);
      toast({
        type: "success",
        title: "Experience & Trade Saved",
        description: "Step 2 of 4 completed successfully!",
      });

      if (onContinue) {
        onContinue();
      } else {
        router.push("/rpl/verify-identity");
      }
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto pb-12"
    >
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl xl:text-[26px] font-bold tracking-tight text-primary">
            Step 2 of 4: Experience & Trade
          </h1>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-0.5">
            This information helps us determine the most suitable qualification
            for your assessment.
          </p>
        </div>

        {/* Section 1: Qualification Applying For */}
        <div className="flex flex-col gap-4 lg:gap-6 mt-1">
          <h2 className="text-lg xl:text-2xl font-extrabold tracking-tight text-neutral-primary flex items-center gap-1.5">
            Qualification Applying For{" "}
            <InfoIcon sectionName="Qualification Applying For" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={
                <span>
                  Qualification Title
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              type="text"
              placeholder="Enter qualification title"
              value={form.qualificationTitle}
              error={errors.qualificationTitle}
              onChange={(e) => update("qualificationTitle", e.target.value)}
            />

            <Input
              label="Qualification Code"
              type="text"
              value={form.qualificationCode}
              onChange={() => {}}
              disabled
              className="bg-input-bg text-text-dark font-medium border-transparent cursor-not-allowed opacity-90"
            />

            <Select
              label={
                <span>
                  Have you completed an assessment before?
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={["Yes", "No"]}
              value={form.completedBefore}
              onChange={(e) => {
                const val = e.target.value;
                update("completedBefore", val);
                if (val === "No") {
                  update("previousAssessmentDetails", "");
                }
              }}
            />

            <Input
              label="Previous Assessment / Certification Details"
              type="text"
              placeholder={
                form.completedBefore === "No"
                  ? "Disabled (Selected 'No' above)"
                  : "Enter details of your previous assessment"
              }
              value={form.previousAssessmentDetails}
              disabled={form.completedBefore === "No"}
              onChange={(e) =>
                update("previousAssessmentDetails", e.target.value)
              }
            />

            <Select
              label={
                <span>
                  Assessment Type
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={["Full Qualification Assessment", "Modular Assessment"]}
              value={form.assessmentType}
              error={errors.assessmentType}
              onChange={(e) => {
                const val = e.target.value;
                update("assessmentType", val);
                if (val === "Full Qualification Assessment") {
                  update("individualUnit", []);
                }
              }}
            />

            <Select
              label={
                <span>
                  Individual Unit{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    (Multiple Selection)
                  </span>
                </span>
              }
              placeholder="Select units"
              multiple={true}
              disabled={form.assessmentType === "Full Qualification Assessment"}
              options={[
                "Unit 1: Health & Safety Practices",
                "Unit 2: Trade Operations & Tools",
                "Unit 3: Quality Control & Supervision",
              ]}
              value={form.individualUnit}
              onChange={(e) => update("individualUnit", e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Current Occupation */}
        <div className="flex flex-col gap-4 lg:gap-6 mt-2">
          <h2 className="text-lg xl:text-2xl font-extrabold tracking-tight text-neutral-primary flex items-center gap-1.5">
            Current Occupation <InfoIcon sectionName="Current Occupation" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={
                <span>
                  Occupation
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={[
                "Carpenter / Joiner",
                "Electrician",
                "Plumber",
                "Welder / Fabricator",
                "Mason / Bricklayer",
                "Automotive Technician",
              ]}
              value={form.occupation}
              error={errors.occupation}
              onChange={(e) => update("occupation", e.target.value)}
            />

            <Select
              label={
                <span>
                  Years Of Experience
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={[
                "1 - 2 years",
                "3 - 5 years",
                "6 - 10 years",
                "10+ years",
              ]}
              value={form.yearsOfExperience}
              error={errors.yearsOfExperience}
              onChange={(e) => update("yearsOfExperience", e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Employment History */}
        <div className="flex flex-col gap-4 lg:gap-6 mt-2">
          <h2 className="text-lg xl:text-2xl font-extrabold tracking-tight text-neutral-primary flex items-center gap-1.5">
            Employment History <InfoIcon sectionName="Employment History" />
          </h2>

          {form.employments.map((emp, idx) => (
            <div key={emp.id} className="flex flex-col gap-4 relative">
              {form.employments.length > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs xl:text-sm font-bold text-primary-solid">
                    Employment #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEmployment(emp.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company/Business Name"
                  type="text"
                  placeholder="Type here"
                  value={emp.companyName}
                  onChange={(e) =>
                    updateEmployment(emp.id, "companyName", e.target.value)
                  }
                />

                <Input
                  label="Job Title"
                  type="text"
                  placeholder="Type here"
                  value={emp.jobTitle}
                  onChange={(e) =>
                    updateEmployment(emp.id, "jobTitle", e.target.value)
                  }
                />

                <Select
                  label="Employment Type"
                  placeholder="Select"
                  options={[
                    "Full-time",
                    "Part-time",
                    "Self-Employed / Freelance",
                    "Contract",
                  ]}
                  value={emp.employmentType}
                  onChange={(e) =>
                    updateEmployment(emp.id, "employmentType", e.target.value)
                  }
                />

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
                    Start and End Date
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <DatePicker
                      placeholder="dd/mm/yy"
                      value={emp.startDate}
                      onChange={(val) =>
                        updateEmployment(emp.id, "startDate", val)
                      }
                      align="left"
                    />
                    <DatePicker
                      placeholder="dd/mm/yy"
                      value={emp.endDate}
                      error={errors[`empDate_${emp.id}`]}
                      onChange={(val) =>
                        updateEmployment(emp.id, "endDate", val)
                      }
                      align="right"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
                  Key Responsibilities
                </label>
                <textarea
                  placeholder="Type here"
                  rows={3}
                  value={emp.responsibilities}
                  onChange={(e) =>
                    updateEmployment(emp.id, "responsibilities", e.target.value)
                  }
                  className="w-full p-3.5 bg-input-bg text-text-dark font-normal text-sm border border-transparent rounded-radius-200 outline-none focus:border-primary-solid/40 focus:ring-2 focus:ring-primary-solid/10 placeholder:text-gray-400 transition-all resize-none"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addEmployment}
            className="self-start text-xs xl:text-sm font-bold text-primary-solid hover:underline flex items-center gap-1 cursor-pointer mt-1"
          >
            + Add Another Employment
          </button>
        </div>

        {/* Section 4: Why are you applying for RPL? */}
        <div className="flex flex-col gap-4 lg:gap-6  mt-2">
          <h2 className="text-lg xl:text-2xl font-extrabold tracking-tight text-neutral-primary flex items-center gap-1.5">
            Why are you applying for RPL?{" "}
            <InfoIcon sectionName="Why are you applying for RPL?" />
          </h2>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="font-sans text-text-dark font-medium text-xs xl:text-sm leading-[1.4] select-none">
              Reason for Seeking RPL
            </label>
            <textarea
              placeholder="Explain why you are seeking Recognition of Prior Learning and what you hope to achieve after certification."
              rows={4}
              value={form.reasonRPL}
              onChange={(e) => update("reasonRPL", e.target.value)}
              className="w-full p-3.5 bg-input-bg text-text-dark font-normal text-sm border border-transparent rounded-radius-200 outline-none focus:border-primary-solid/40 focus:ring-2 focus:ring-primary-solid/10 placeholder:text-gray-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Section 5: Evidence Summary */}
        <div className="flex flex-col gap-4 lg:gap-6  mt-2">
          <h2 className="text-lg xl:text-2xl font-extrabold tracking-tight text-neutral-primary flex items-center gap-1.5">
            Evidence Summary <InfoIcon sectionName="Evidence Summary" />
          </h2>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal">
            Which evidence can you provide? (Multiple Selection)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
            {EVIDENCE_OPTIONS.map((item) => {
              const isChecked = form.selectedEvidence.includes(item);
              return (
                <div
                  key={item}
                  onClick={() => toggleEvidence(item)}
                  className={`
                    flex items-center justify-between p-3.5 h-20
                    bg-input-bg rounded-xl border cursor-pointer select-none transition-all duration-200
                    ${
                      isChecked
                        ? "border-secondary bg-white ring-1 ring-secondary/40 shadow-xs"
                        : "border-[#D9D9D980] hover:border-gray-300"
                    }
                  `}
                >
                  <span className="text-xs xl:text-sm font-medium text-text-dark leading-tight pr-2">
                    {item}
                  </span>

                  <div
                    className={`
                      w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0
                      ${
                        isChecked
                          ? "bg-secondary border-secondary text-white"
                          : "border-border-gray bg-inherit"
                      }
                    `}
                  >
                    {isChecked && <FiCheck className="w-3 h-3 stroke-3" />}
                  </div>
                </div>
              );
            })}
          </div>

          {form.selectedEvidence.includes("Other") && (
            <div className="mt-3 w-full animate-fadeIn">
              <Input
                label="Specify Other Evidence"
                type="text"
                placeholder="Type details of your other evidence..."
                value={form.otherEvidenceText}
                onChange={(e) => update("otherEvidenceText", e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-8 pt-4 border-t border-gray-100 gap-4">
          <button
            type="button"
            onClick={onBack || (() => router.back())}
            className="flex items-center justify-center gap-2 text-sm font-medium text-black hover:text-text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-5 h-11 bg-white border border-secondary text-secondary hover:bg-secondary/10 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer whitespace-nowrap"
            >
              <span>Save As Draft</span>
              <Image
                src={saveIcon}
                alt="Save icon"
                width={20}
                height={20}
                className="w-5 h-5 shrink-0"
              />
            </button>

            <Button
              type="submit"
              variant="amber"
              size="md"
              loading={form.isSubmitting}
              rightIcon={<FiArrowRight className="w-4.5 h-4.5" />}
              className="px-8 h-11 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
            >
              Continue
            </Button>
          </div>
        </div>
      </form>

      <StatusModal
        isOpen={showConfirmDraftModal}
        variant="save-draft-confirm"
        onClose={() => setShowConfirmDraftModal(false)}
        onAction={handleConfirmSaveDraft}
      />

      <StatusModal
        isOpen={showDraftModal}
        variant="draft-saved"
        onClose={() => setShowDraftModal(false)}
        onAction={() => router.push("/dashboard")}
      />

      <StatusModal
        isOpen={form.showSuccessModal}
        type="success"
        title="Step 2 Completed"
        description="Experience & Trade information saved successfully!"
        actionLabel="Go to Dashboard"
        onAction={() => router.push("/dashboard")}
      />
    </motion.div>
  );
};
