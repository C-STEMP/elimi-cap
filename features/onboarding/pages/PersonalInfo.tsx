"use client";

import React, { useState, useEffect } from "react";
import { Form } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { PhoneInput } from "@/components/ui/phone-input";
import { PassportUpload } from "@/components/ui/passport-upload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { InfoIcon } from "@/components/ui/info-icon";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { StatusModal } from "@/components/ui/status-modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarVariant } from "@/store/slices/authSlice";
import { setPersonalInfo } from "@/store/slices/onboardingSlice";
import { personalInfoSchema } from "@/lib/validation";

// antd-zod rule — validates any field against its key in personalInfoSchema
const rule = createSchemaFieldRule(personalInfoSchema);

export interface PersonalInfoProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

// ─── Adapter wrappers ─────────────────────────────────────────────────────────
// Ant Design Form.Item injects `value` and `onChange` via cloneElement into the
// direct child. Our custom inputs use standard `onChange: (e: ChangeEvent) => void`
// for text/select fields, and custom signatures for phone/date. These wrappers
// translate between Form's expected `onChange(value)` → component's native API.

interface ControlledInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  [key: string]: unknown;
}

/** Wraps our `<Input>` so Form gets a plain-string onChange */
const FormInput: React.FC<
  ControlledInputProps & {
    label: React.ReactNode;
    type?: string;
    placeholder?: string;
  }
> = ({ value = "", onChange, onBlur, ...rest }) => (
  <Input
    {...rest}
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    onBlur={onBlur}
  />
);

/** Wraps our `<Select>` so Form gets a plain-string onChange */
const FormSelect: React.FC<
  ControlledInputProps & {
    label: React.ReactNode;
    placeholder?: string;
    options: string[];
  }
> = ({ value = "", onChange, ...rest }) => (
  <Select
    {...rest}
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
  />
);

/** Wraps our `<DatePicker>` – already uses string onChange */
const FormDatePicker: React.FC<
  ControlledInputProps & {
    label: React.ReactNode;
    placeholder?: string;
    maxYear?: number;
  }
> = ({ value = "", onChange, ...rest }) => (
  <DatePicker
    {...rest}
    value={value}
    onChange={(val) => onChange?.(val)}
  />
);

/** Wraps our `<PhoneInput>` – already uses string onChange */
const FormPhoneInput: React.FC<
  ControlledInputProps & {
    label: React.ReactNode;
    country?: string;
    preferredCountries?: string[];
  }
> = ({ value = "", onChange, ...rest }) => (
  <PhoneInput
    {...rest}
    value={value}
    onChange={(v) => onChange?.(v)}
  />
);

// ─────────────────────────────────────────────────────────────────────────────

export const PersonalInfo: React.FC<PersonalInfoProps> = ({
  onBack,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportError, setPassportError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();

  // Restore persisted form values on mount
  const savedPersonalInfo = useAppSelector((s) => s.onboarding.personalInfo);

  useEffect(() => {
    dispatch(setSidebarVariant("default"));
  }, [dispatch]);

  useEffect(() => {
    // Pre-fill from Redux (restores values when navigating back)
    const { passportFileName: _ignored, ...fields } = savedPersonalInfo;
    form.setFieldsValue(fields);
  }, [form, savedPersonalInfo]);

  // Persist values to Redux on every change
  const handleValuesChange = (
    changedValues: Partial<Record<string, string>>
  ) => {
    dispatch(setPersonalInfo(changedValues as Partial<typeof savedPersonalInfo>));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleFinish = (values: Record<string, string>) => {
    if (!passportFile) {
      setPassportError("Passport photograph is required");
      toast({
        type: "error",
        title: "Input Required",
        description: "Please upload your passport photograph.",
      });
      return;
    }

    setIsSubmitting(true);
    dispatch(
      setPersonalInfo({
        ...values,
        passportFileName: passportFile.name,
      })
    );

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/onboarding/success");
      }
    }, 600);
  };

  const handleFinishFailed = () => {
    if (!passportFile) {
      setPassportError("Passport photograph is required");
    }
    toast({
      type: "error",
      title: "Input Required",
      description:
        "Please upload your passport photograph and fill in all required fields.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 select-text max-w-2xl mx-auto"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
        onValuesChange={handleValuesChange}
        className="w-full flex flex-col gap-6"
      >
        <div className="w-full flex justify-start mb-1">
          <button
            type="button"
            onClick={onBack || (() => router.back())}
            className="flex items-center gap-2 text-sm font-medium text-neutral-secondary hover:text-text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Step progress bar */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
          <div className="flex flex-col w-full sm:w-auto">
            <div className="w-full max-w-109.75 flex justify-start mb-4 sm:mb-6">
              <div className="w-46.5 h-2.5 bg-primary-solid/15 rounded-[10px] overflow-hidden">
                <div className="w-5/6 h-full bg-primary-solid rounded-[10px] transition-all duration-300" />
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary">
                Personal Information
              </h1>
              <p className="text-neutral-secondary text-xs sm:text-sm font-normal mt-1">
                Provide your details to complete your profile
              </p>
            </div>
          </div>

          <PassportUpload
            required
            error={passportError}
            onImageChange={(file) => {
              setPassportFile(file);
              if (file) setPassportError("");
            }}
          />
        </div>

        {/* Personal Information Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item name="firstName" rules={[rule]}>
            <FormInput
              label={
                <span>
                  First Name<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              type="text"
              placeholder="First name"
            />
          </Form.Item>

          <Form.Item name="lastName" rules={[rule]}>
            <FormInput
              label={
                <span>
                  Last Name<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              type="text"
              placeholder="Surname"
            />
          </Form.Item>

          <Form.Item name="middleName">
            <FormInput
              label="Middle Name"
              type="text"
              placeholder="Other names"
            />
          </Form.Item>

          <Form.Item name="dob" rules={[rule]}>
            <FormDatePicker
              label={
                <span>
                  Date Of Birth
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="dd/mm/yyyy"
              maxYear={new Date().getFullYear() - 18}
            />
          </Form.Item>

          <Form.Item name="gender" rules={[rule]}>
            <FormSelect
              label={
                <span>
                  Gender<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={["Male", "Female", "Prefer not to say"]}
            />
          </Form.Item>

          <Form.Item name="nationality" rules={[rule]}>
            <FormSelect
              label={
                <span>
                  Nationality
                  <span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={["Nigerian", "Ghanaian", "Kenyan", "South African", "Other"]}
            />
          </Form.Item>
        </div>

        {/* Section 2: Contact Information */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
            Contact Information <InfoIcon sectionName="Contact Information" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item name="email" rules={[rule]}>
              <FormInput
                label={
                  <span>
                    Email Address
                    <span className="text-primary-solid ml-0.5">*</span>
                  </span>
                }
                type="email"
                placeholder="yourname@email.com"
              />
            </Form.Item>

            <Form.Item name="phoneNumber" rules={[rule]}>
              <FormPhoneInput
                label={
                  <span>
                    Phone Number
                    <span className="text-primary-solid ml-0.5">*</span>
                  </span>
                }
                country="ng"
                preferredCountries={["ng", "gh", "ke", "za"]}
              />
            </Form.Item>
          </div>
        </div>

        {/* Section 3: Residential Address */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
            Residential Address <InfoIcon sectionName="Residential Address" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item name="country" rules={[rule]}>
              <FormSelect
                label={
                  <span>
                    Country
                    <span className="text-primary-solid ml-0.5">*</span>
                  </span>
                }
                placeholder="Select"
                options={["Nigeria", "Ghana", "Kenya", "South Africa", "Other"]}
              />
            </Form.Item>

            <Form.Item name="state" rules={[rule]}>
              <FormSelect
                label={
                  <span>
                    State of Residence
                    <span className="text-primary-solid ml-0.5">*</span>
                  </span>
                }
                placeholder="Select"
                options={[
                  "Lagos",
                  "Oyo",
                  "FCT Abuja",
                  "Rivers",
                  "Ogun",
                  "Enugu",
                  "Kano",
                  "Delta",
                ]}
              />
            </Form.Item>

            <Form.Item name="lga" rules={[rule]}>
              <FormSelect
                label={
                  <span>
                    Local Government Area (LGA)
                    <span className="text-primary-solid ml-0.5">*</span>
                  </span>
                }
                placeholder="Select"
                options={[
                  "Ibadan North",
                  "Ikeja",
                  "Abuja Municipal",
                  "Eti-Osa",
                  "Port Harcourt",
                  "Obafemi Owode",
                ]}
              />
            </Form.Item>

            <Form.Item name="streetAddress" rules={[rule]}>
              <FormInput
                label={
                  <span>
                    Residential Address
                    <span className="text-primary-solid ml-0.5">*</span>
                  </span>
                }
                type="text"
                placeholder="Street Address"
              />
            </Form.Item>
          </div>
        </div>

        {/* Section 4: Accessibility */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-base sm:text-lg font-bold text-text-dark flex items-center gap-1.5">
            Accessibility <InfoIcon sectionName="Accessibility" />
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <Form.Item name="impairment" rules={[rule]}>
              <FormSelect
                label={
                  <span>
                    Do you have any impairment?
                    <span className="text-primary-solid ml-0.5">*</span>
                  </span>
                }
                placeholder="Select"
                options={[
                  "No",
                  "Visual impairment",
                  "Hearing impairment",
                  "Mobility impairment",
                  "Other",
                ]}
              />
            </Form.Item>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack || (() => router.back())}
            className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none focus:outline-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Button
            type="submit"
            variant="amber"
            size="md"
            loading={isSubmitting}
            rightIcon={<FiArrowRight className="w-4.5 h-4.5" />}
            className="px-8 h-11 text-white font-bold text-sm rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
          >
            Continue
          </Button>
        </div>
      </Form>

      <StatusModal
        isOpen={showSuccessModal}
        type="success"
        title="Personal Information Saved"
        description="Your profile details have been saved successfully!"
        actionLabel="Continue"
        onAction={() => setShowSuccessModal(false)}
      />
    </motion.div>
  );
};
