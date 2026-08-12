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

const rule = createSchemaFieldRule(startApplicationSchema);

export interface StartApplicationProps {
  onBack?: () => void;
  onContinue?: () => void;
}

interface ControlledSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  label: React.ReactNode;
  placeholder?: string;
  options: (string | SelectOption)[];
  disabled?: boolean;
  error?: string;
  help?: string;
}

const FormSelect: React.FC<ControlledSelectProps> = ({
  value = "",
  onChange,
  error,
  help,
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

  const { data: remoteSectors = [], isLoading: isLoadingSectors } =
    useGetSectors();
  const { data: remoteCentres = [], isLoading: isLoadingCentres } =
    useGetCentres();

  const selectedSectorId = Form.useWatch("sector", form);
  const { data: remoteTrades = [], isLoading: isLoadingTrades } =
    useGetTradesBySector(selectedSectorId);

  const centreOptions: SelectOption[] = remoteCentres.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const sectorOptions: SelectOption[] = remoteSectors.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const tradeOptions: SelectOption[] = remoteTrades.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  const savedStartApplication = useAppSelector(
    (s) => s.onboarding.startApplication,
  );

  useEffect(() => {
    form.setFieldsValue(savedStartApplication);
  }, [form, savedStartApplication]);

  const handleValuesChange = (changedValues: Record<string, string>) => {
    if ("sector" in changedValues) {
      form.setFieldValue("trade", "");
    }
    dispatch(setStartApplication(form.getFieldsValue()));
  };

  const handleFinish = (values: {
    assessmentCenter: string;
    sector: string;
    trade: string;
  }) => {
    setIsSubmitting(true);

    const payload = {
      type: "RPL" as const,
      centreId: values.assessmentCenter,
      sectorId: values.sector,
      tradeId: values.trade,
      unitIds: [],
    };

    createApplication.mutate(payload, {
      onSuccess: (res) => {
        setIsSubmitting(false);
        dispatch(
          createApplicationSlice({
            title: values.trade,
            subtitle: values.sector,
          }),
        );
        setShowSuccessModal(true);
      },
      onError: (err) => {
        setIsSubmitting(false);
        toast({
          type: "error",
          title: "Application Error",
          description: err.message || "Failed to start application. Please try again.",
        });
      },
    });
  };

  const handleModalAction = () => {
    setShowSuccessModal(false);
    onContinue?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-140 mx-auto flex flex-col justify-center select-text"
    >
      <div className="mb-6 text-center lg:text-left w-full flex flex-col items-center lg:items-start">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-neutral-primary text-center lg:text-left">
          Start Application
        </h1>
        <p className="text-neutral-secondary text-[14px] xl:text-[15px] leading-relaxed mt-1.5 max-w-md font-normal text-center lg:text-left mx-auto lg:mx-0">
          Select your Assessment Centre, Sector, and Trade to begin your
          Recognition of Prior Learning process.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        className="w-full flex flex-col gap-5"
        requiredMark={false}
      >
        <Form.Item name="assessmentCenter" rules={[rule]}>
          <FormSelect
            label={
              <span>
                Assessment Centre
                <span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder={
              isLoadingCentres ? "Loading centres..." : "Select Centre"
            }
            options={centreOptions}
          />
        </Form.Item>

        <Form.Item name="sector" rules={[rule]}>
          <FormSelect
            label={
              <span>
                Sector<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder={
              isLoadingSectors ? "Loading sectors..." : "Select Sector"
            }
            options={sectorOptions}
          />
        </Form.Item>

        <Form.Item name="trade" rules={[rule]}>
          <FormSelect
            label={
              <span>
                Trade<span className="text-primary-solid ml-0.5">*</span>
              </span>
            }
            placeholder={
              isLoadingTrades
                ? "Loading trades..."
                : selectedSectorId
                ? "Select Trade"
                : "Select a Sector first"
            }
            disabled={!selectedSectorId || isLoadingTrades}
            options={tradeOptions}
          />
        </Form.Item>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-6 pt-4 border-t border-gray-100 gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 text-sm font-medium text-black hover:text-text-dark transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4 text-black" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="secondary"
              size="md"
              loading={isSubmitting}
              className="px-6 h-11 text-white font-bold text-sm bg-secondary hover:bg-secondary-hover rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer whitespace-nowrap"
            >
              <span>Continue</span>
              <FiArrowRight className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </Form>

      <StatusModal
        isOpen={showSuccessModal}
        onClose={handleModalAction}
        type="success"
        title="Application Started"
        description="Your RPL application has been initialized. Proceed to fill out your details."
        actionLabel="Continue Application"
      />
    </motion.div>
  );
};
