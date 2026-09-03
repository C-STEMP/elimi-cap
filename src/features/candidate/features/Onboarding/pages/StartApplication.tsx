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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setStartApplication,
  setRPLExperienceTrade,
} from "@/store/slices/onboardingSlice";
import { startApplicationSchema } from "@/src/lib/validation";

import { useGetApplications, useApplication } from "@/src/features/candidate/features/Application/hooks";
import {
  useGetSectors,
  useGetCentres,
  useGetTradesBySector,
} from "@/src/features/shared/reference/hooks";
import {
  setCurrentApplication,
  createApplication as createApplicationSlice,
} from "@/store/slices/applicationSlice";

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
  loading?: boolean;
  error?: string;
  help?: string;
}

const FormSelect: React.FC<ControlledSelectProps> = ({
  value = "",
  onChange,
  error,
  help,
  loading,
  ...rest
}) => (
  <Select
    {...rest}
    loading={loading}
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

  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { createApplication } = useApplication();

  const assessmentType = useAppSelector(
    (state) =>
      state.onboarding.assessmentType ||
      state.auth.user?.assessmentType ||
      "rpl",
  );

  const { data: remoteSectors = [], isLoading: isLoadingSectors } =
    useGetSectors();
  const { data: remoteCentres = [], isLoading: isLoadingCentres } =
    useGetCentres();

  const selectedSectorId = Form.useWatch("sector", form);
  const { data: remoteTrades = [], isLoading: isLoadingTrades } =
    useGetTradesBySector(selectedSectorId);

  const centreOptions: SelectOption[] = React.useMemo(() => {
    const list = Array.isArray(remoteCentres)
      ? remoteCentres
      : (remoteCentres as any)?.data || [];

    const seen = new Set<string>();
    const uniqueOptions: SelectOption[] = [];

    for (const c of list) {
      if (!c || !c.name) continue;
      const normalized = c.name.trim().toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        uniqueOptions.push({
          label: c.name.trim(),
          value: c.id,
        });
      }
    }
    return uniqueOptions;
  }, [remoteCentres]);

  const sectorOptions: SelectOption[] = remoteSectors.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const tradeOptions: SelectOption[] = remoteTrades.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  const { data: existingApps = [] } = useGetApplications();

  const savedStartApplication = useAppSelector(
    (s) => s.onboarding.startApplication,
  );

  useEffect(() => {
    if (
      savedStartApplication.trade ||
      savedStartApplication.sector ||
      savedStartApplication.assessmentCenter
    ) {
      const isRawId = (val?: string) => {
        if (!val) return false;
        return (
          /^[0-9A-Z]{20,}$/i.test(val) ||
          /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(val)
        );
      };

      const valuesToSet: Record<string, string> = {};
      if (
        savedStartApplication.assessmentCenter &&
        !isRawId(savedStartApplication.assessmentCenter)
      ) {
        valuesToSet.assessmentCenter = savedStartApplication.assessmentCenter;
      }
      if (
        savedStartApplication.sector &&
        !isRawId(savedStartApplication.sector)
      ) {
        valuesToSet.sector = savedStartApplication.sector;
      }
      if (
        savedStartApplication.trade &&
        !isRawId(savedStartApplication.trade)
      ) {
        valuesToSet.trade = savedStartApplication.trade;
      }
      if (Object.keys(valuesToSet).length > 0) {
        form.setFieldsValue(valuesToSet);
      }
    }
  }, [form, savedStartApplication]);

  const handleValuesChange = (changedValues: Record<string, string>) => {
    if ("sector" in changedValues) {
      form.setFieldValue("trade", "");
    }
    const currentValues = form.getFieldsValue();
    const tradeObj = remoteTrades.find((t) => t.id === currentValues.trade);
    const sectorObj = remoteSectors.find((s) => s.id === currentValues.sector);
    const centreObj = remoteCentres.find(
      (c) => c.id === currentValues.assessmentCenter,
    );

    const resolvedTradeName = tradeObj?.name || currentValues.trade || "";

    dispatch(
      setStartApplication({
        ...currentValues,
        tradeName: resolvedTradeName,
        sectorName: sectorObj?.name || currentValues.sector,
        centreName: centreObj?.name || currentValues.assessmentCenter,
      }),
    );

    if (resolvedTradeName) {
      dispatch(
        setRPLExperienceTrade({
          qualificationTitle: resolvedTradeName,
        }),
      );
    }
  };

  const handleFinish = (values: {
    assessmentCenter: string;
    sector: string;
    trade: string;
  }) => {
    if (!values.assessmentCenter || !values.sector || !values.trade) {
      toast({
        type: "error",
        title: "Required Fields",
        description: "Please select an assessment centre, sector, and trade.",
      });
      return;
    }

    const tradeObj = remoteTrades.find((t) => t.id === values.trade);
    const tradeName = tradeObj?.name || values.trade;
    const sectorObj = remoteSectors.find((s) => s.id === values.sector);
    const sectorName = sectorObj?.name || values.sector;
    const centreObj = remoteCentres.find(
      (c) => c.id === values.assessmentCenter,
    );
    const centreName = centreObj?.name || values.assessmentCenter;

    setIsSubmitting(true);
    dispatch(
      setStartApplication({
        ...values,
        tradeName,
        sectorName,
        centreName,
      }),
    );
    dispatch(
      setRPLExperienceTrade({
        qualificationTitle: tradeName,
      }),
    );

    const appType = assessmentType === "nsq" ? "NSQ" : "RPL";

    const existingApp = existingApps.find(
      (a) => (a.type || "RPL").toUpperCase() === appType.toUpperCase(),
    );

    if (existingApp) {
      if (existingApp.status !== "draft") {
        toast({
          type: "info",
          title: `${appType} Application Already Submitted`,
          description: `You have already submitted an ${appType} application. You can only have one ${appType} application.`,
        });
        router.push(`/dashboard/applications/${existingApp.id}`);
        return;
      }

      toast({
        type: "info",
        title: "Draft Application Found",
        description:
          "You have a saved draft application. Continuing to your application details...",
      });
      dispatch(setCurrentApplication(existingApp.id));
      if (onContinue) {
        onContinue();
      } else {
        router.push("/rpl/personal-info");
      }
      return;
    }

    createApplication.mutate(
      {
        type: appType,
        centreId: values.assessmentCenter,
        sectorId: values.sector,
        tradeId: values.trade,
        unitIds: [],
      },
      {
        onSuccess: (res: any) => {
          setIsSubmitting(false);
          const createdApp = res?.data || res;
          if (createdApp?.id) {
            dispatch(setCurrentApplication(createdApp.id));
          }
          dispatch(
            createApplicationSlice({
              title: tradeName,
              subtitle: sectorName,
            }),
          );

          if (onContinue) {
            onContinue();
          } else if (appType === "RPL") {
            router.push("/rpl/personal-info");
          } else {
            router.push(
              createdApp?.id
                ? `/dashboard/applications/${createdApp.id}`
                : "/dashboard/applications",
            );
          }
        },
        onError: (err: any) => {
          setIsSubmitting(false);
          const errorMsg = err?.message?.toLowerCase() || "";
          const isConflict =
            errorMsg.includes("already") ||
            errorMsg.includes("in-progress") ||
            errorMsg.includes("exists") ||
            err?.statusCode === 409;

          if (isConflict) {
            dispatch(
              createApplicationSlice({
                title: tradeName,
                subtitle: sectorName,
              }),
            );
            if (onContinue) {
              onContinue();
            } else if (appType === "RPL") {
              router.push("/rpl/personal-info");
            } else {
              router.push("/dashboard/applications");
            }
          } else {
            toast({
              type: "error",
              title: "Application Error",
              description:
                err.message ||
                "Failed to initialize application. Please try again.",
            });
            if (appType === "RPL") {
              router.push("/rpl/personal-info");
            }
          }
        },
      },
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/onboarding/assessment-type");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-110 mx-auto flex flex-col justify-center select-text"
    >
      <div className="mb-6 text-left w-full flex flex-col items-start">
        <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-primary">
          Start Application
        </h1>
        <p className="text-neutral-secondary text-sm font-normal mt-0.5">
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
        onValuesChange={handleValuesChange}
        className="w-full flex flex-col"
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
            loading={isLoadingCentres}
            disabled={isLoadingCentres}
            placeholder={
              isLoadingCentres ? "Loading centres..." : "Select"
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
            loading={isLoadingSectors}
            disabled={isLoadingSectors}
            placeholder={
              isLoadingSectors ? "Loading sectors..." : "Select"
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
            loading={isLoadingTrades}
            placeholder={
              isLoadingTrades
                ? "Loading trades..."
                : selectedSectorId
                ? "Select"
                : "Select a Sector first"
            }
            disabled={!selectedSectorId || isLoadingTrades}
            options={tradeOptions}
          />
        </Form.Item>

        <div className="flex items-center justify-between mt-8 pt-4 gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-semibold text-neutral-secondary hover:text-neutral-primary transition-colors cursor-pointer select-none focus:outline-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Button
            type="submit"
            variant="amber"
            size="lg"
            loading={isSubmitting}
            className="px-8 h-12 text-white font-bold text-base bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer whitespace-nowrap"
          >
            <span>Continue</span>
            <FiArrowRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </Form>
    </motion.div>
  );
};
