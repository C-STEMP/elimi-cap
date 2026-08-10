"use client";

import React, { useEffect, useState } from "react";
import { Form } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { Select, SelectOption } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { StatusModal } from "@/components/status-modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createApplication as createApplicationSlice } from "@/store/slices/applicationSlice";
import { setStartApplication } from "@/store/slices/onboardingSlice";
import { startApplicationSchema } from "@/src/lib/validation";

import { useApplication } from "@/src/features/candidate/features/Application/hooks";
import {
  useGetSectors,
  useGetCentres,
  useGetTradesBySector,
} from "@/src/features/shared/reference/hooks";

// antd-zod rule for startApplicationSchema
const rule = createSchemaFieldRule(startApplicationSchema);

export interface StartApplicationProps {
  onBack?: () => void;
  onContinue?: () => void;
}

const ASSESSMENT_CENTERS = [
  "Abuja Vocational & Technical Center",
  "Lagos Skill Assessment Hub",
  "Ibadan TVET Center of Excellence",
  "Port Harcourt Trade Center",
  "Enugu Vocational Institute",
  "Kano Competency Assessment Center",
];

const SECTORS = [
  "Construction & Building Services",
  "Automotive & Mechanical",
  "Electrical & Energy",
  "Hospitality & Tourism",
  "Information Technology",
  "Agriculture & Food",
];

const TRADES = [
  "Carpentry & Joinery",
  "Electrical Installation",
  "Plumbing & Pipefitting",
  "Welding & Metal Fabrication",
  "Masonry & Construction",
  "Automotive Mechanics",
  "Solar PV Installation",
  "Air Conditioning & Refrigeration",
];

interface ControlledSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  label: React.ReactNode;
  placeholder?: string;
  options: (string | SelectOption)[];
  disabled?: boolean;
}

const FormSelect: React.FC<ControlledSelectProps> = ({
  value = "",
  onChange,
  ...rest
}) => (
  <Select
    {...rest}
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
  />
);

export const StartApplication: React.FC<StartApplicationProps> = ({
  onBack,
  onContinue,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { createApplication } = useApplication();

  const { data: remoteSectors } = useGetSectors();
  const { data: remoteCentres } = useGetCentres();

  const selectedSectorId = Form.useWatch("sector", form);
  const { data: remoteTrades } = useGetTradesBySector(selectedSectorId);

  const centreOptions: SelectOption[] = remoteCentres?.length
    ? remoteCentres.map((c) => ({ label: c.name, value: c.id }))
    : ASSESSMENT_CENTERS.map((name) => ({ label: name, value: name }));

  const sectorOptions: SelectOption[] = remoteSectors?.length
    ? remoteSectors.map((s) => ({ label: s.name, value: s.id }))
    : SECTORS.map((name) => ({ label: name, value: name }));

  const tradeOptions: SelectOption[] = remoteTrades?.length
    ? remoteTrades.map((t) => ({ label: t.name, value: t.id }))
    : TRADES.map((name) => ({ label: name, value: name }));

  const savedStartApplication = useAppSelector(
    (s) => s.onboarding.startApplication,
  );

  useEffect(() => {
    form.setFieldsValue(savedStartApplication);
  }, [form, savedStartApplication]);

  const handleValuesChange = (changedValues: Record<string, string>) => {
    dispatch(setStartApplication(changedValues));
  };

  const handleFinish = (values: {
    assessmentCenter: string;
    sector: string;
    trade: string;
  }) => {
    setIsSubmitting(true);

    const selectedTradeObj = remoteTrades?.find((t) => t.id === values.trade);
    const tradeTitle = selectedTradeObj?.name || values.trade;

    dispatch(setStartApplication(values));
    dispatch(
      createApplicationSlice({
        title: tradeTitle,
        subtitle: "Recognition Of Prior Learning",
      }),
    );

    createApplication.mutate(
      {
        type: "RPL",
        sectorId: values.sector,
        tradeId: values.trade,
        unitIds: [],
        centreId: values.assessmentCenter,
      },
      {
        onSettled: () => {
          setIsSubmitting(false);
          if (onContinue) {
            onContinue();
          } else {
            router.push("/rpl/personal-info");
          }
        },
      },
    );
  };

  const handleFinishFailed = () => {
    toast({
      type: "error",
      title: "Selection Required",
      description: "Please fill in all required fields.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-110 mx-auto flex flex-col justify-center select-text"
    >
      <div className="mb-4 text-left w-full">
        <h1 className="text-2xl xl:text-[28px] font-extrabold tracking-tight text-primary">
          Start Application
        </h1>
        <p className="text-neutral-secondary text-xs xl:text-sm font-normal mt-1">
          Your journey is about to start
        </p>

        <h2 className="text-xl xl:text-2xl font-extrabold tracking-tight text-neutral-primary mt-4">
          Centre Information
        </h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
        onValuesChange={handleValuesChange}
        className="w-full flex flex-col gap-3.5"
      >
        <Form.Item name="assessmentCenter" rules={[rule]} className="mb-0!">
          <FormSelect
            label={
              <span>
                Assessment Centre
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={centreOptions}
          />
        </Form.Item>

        <Form.Item name="sector" rules={[rule]} className="mb-0!">
          <FormSelect
            label={
              <span>
                Sector<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={sectorOptions}
          />
        </Form.Item>

        <Form.Item name="trade" rules={[rule]} className="mb-0!">
          <FormSelect
            label={
              <span>
                Trade<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder="Select"
            options={tradeOptions}
          />
        </Form.Item>

        <div className="flex items-center justify-between mt-6">
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
            className="px-8 h-11 font-bold text-sm rounded-xl shadow-lg cursor-pointer whitespace-nowrap"
          >
            Continue
          </Button>
        </div>
      </Form>

      <StatusModal
        isOpen={showSuccessModal}
        type="success"
        title="Application Submitted"
        description="Your assessment center and trade selections have been recorded!"
        actionLabel="Go to Dashboard"
        onAction={() => router.push("/dashboard?status=submitted")}
      />
    </motion.div>
  );
};
