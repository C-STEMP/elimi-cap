"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Select, SelectOption } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setNsqApplication } from "@/src/store/slices/onboardingSlice";
import { createApplication } from "@/src/store/slices/applicationSlice";
import {
  useGetCentres,
  useGetSectors,
  useGetTradesBySector,
} from "@/src/features/shared/reference/hooks";
import {
  createApplicationApi,
  getApplicationsApi,
} from "@/src/features/shared/applications/api";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks";
import { NsqConfirmationModal } from "../components/NsqConfirmationModal";

export const NsqCentreInfo: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saved = useAppSelector((state) => state.onboarding.nsqApplication);

  const [centreId, setCentreId] = useState(saved.centreId || "");
  const [sectorId, setSectorId] = useState(saved.sectorId || "");
  const [tradeId, setTradeId] = useState(saved.tradeId || "");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{
    centreId?: string;
    sectorId?: string;
    tradeId?: string;
  }>({});

  const { data: remoteCentres = [], isLoading: isLoadingCentres } =
    useGetCentres();
  const { data: remoteSectors = [], isLoading: isLoadingSectors } =
    useGetSectors();
  const { data: remoteTrades = [], isLoading: isLoadingTrades } =
    useGetTradesBySector(sectorId);

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

  useEffect(() => {
    if (saved.centreId && !centreId) setCentreId(saved.centreId);
    if (saved.sectorId && !sectorId) setSectorId(saved.sectorId);
    if (saved.tradeId && !tradeId) setTradeId(saved.tradeId);
  }, [saved, centreId, sectorId, tradeId]);

  const handleSectorChange = (newSectorId: string) => {
    setSectorId(newSectorId);
    setTradeId("");
    if (errors.sectorId) setErrors((prev) => ({ ...prev, sectorId: undefined }));
    if (errors.tradeId) setErrors((prev) => ({ ...prev, tradeId: undefined }));
  };

  const handleCentreChange = (newCentreId: string) => {
    setCentreId(newCentreId);
    if (errors.centreId) setErrors((prev) => ({ ...prev, centreId: undefined }));
  };

  const handleTradeChange = (newTradeId: string) => {
    setTradeId(newTradeId);
    if (errors.tradeId) setErrors((prev) => ({ ...prev, tradeId: undefined }));
  };

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!centreId) nextErrors.centreId = "Assessment Centre is required";
    if (!sectorId) nextErrors.sectorId = "Sector is required";
    if (!tradeId) nextErrors.tradeId = "Trade is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        type: "error",
        title: "Selection Required",
        description: "Please select an assessment centre, sector, and trade to continue.",
      });
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmSendRequest = async () => {
    const selectedCentre = remoteCentres.find((c) => c.id === centreId);
    const selectedSector = remoteSectors.find((s) => s.id === sectorId);
    const selectedTrade = remoteTrades.find((t) => t.id === tradeId);

    dispatch(
      setNsqApplication({
        centreId,
        centreName: selectedCentre?.name || "",
        sectorId,
        sectorName: selectedSector?.name || "",
        tradeId,
        tradeName: selectedTrade?.name || "",
      }),
    );

    setIsSubmitting(true);
    try {
      let appId = "";
      try {
        const app = await createApplicationApi({
          type: "NSQ",
          centreId,
          sectorId,
          tradeId,
          unitIds: [],
        });
        if (app?.id) appId = app.id;
      } catch (createErr: any) {
        const msg = createErr?.message || "";
        const code = createErr?.code || "";
        if (
          code === "application.trade_in_progress" ||
          msg.includes("in-progress") ||
          createErr?.statusCode === 409
        ) {
          const list = await getApplicationsApi();
          const match = list.find(
            (a) =>
              a.type === "NSQ" &&
              (a.status === "draft" ||
                a.status === "in_progress" ||
                (a.status as string) === "submitted"),
          );
          if (match?.id) appId = match.id;
          else throw createErr;
        } else {
          throw createErr;
        }
      }

      // Also track in Redux application slice
      dispatch(
        createApplication({
          title: selectedTrade?.name || "Standard Assessment (NSQ)",
          subtitle: `${selectedCentre?.name || ""} | ${selectedSector?.name || ""}`,
        }),
      );

      // Invalidate applications query cache
      queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });

      toast({
        type: "success",
        title: "Request Sent to Centre",
        description: "Your request has been successfully sent to the centre.",
      });

      setIsConfirmModalOpen(false);
      router.push("/dashboard/applications");
    } catch (err: any) {
      toast({
        type: "error",
        title: "Request Failed",
        description: err?.message || "Could not send request to centre. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/assessment-type");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col justify-center select-text max-w-xl mx-auto px-4 sm:px-0"
    >
      <form onSubmit={handleOpenConfirm} className="w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <span className="text-[#a31d38] font-bold text-sm sm:text-base tracking-tight">
            Start Application
          </span>
          <p className="text-neutral-secondary text-xs sm:text-sm font-normal">
            Your journey is about to start
          </p>
        </div>

        {/* Centre Information Section */}
        <div className="flex flex-col gap-5 pt-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-primary tracking-tight">
            Centre Information
          </h2>

          <div className="flex flex-col gap-4">
            <Select
              label={
                <span>
                  Assessment Centre<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={centreOptions}
              value={centreId}
              loading={isLoadingCentres}
              onChange={(e) => handleCentreChange(e.target.value)}
              error={errors.centreId}
            />

            <Select
              label={
                <span>
                  Sector<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder="Select"
              options={sectorOptions}
              value={sectorId}
              loading={isLoadingSectors}
              onChange={(e) => handleSectorChange(e.target.value)}
              error={errors.sectorId}
            />

            <Select
              label={
                <span>
                  Trade<span className="text-primary-solid ml-0.5">*</span>
                </span>
              }
              placeholder={
                !sectorId
                  ? "Select sector first"
                  : isLoadingTrades
                  ? "Loading trades..."
                  : "Select"
              }
              options={tradeOptions}
              value={tradeId}
              disabled={!sectorId || isLoadingTrades}
              loading={isLoadingTrades}
              onChange={(e) => handleTradeChange(e.target.value)}
              error={errors.tradeId}
            />
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-neutral-secondary hover:text-neutral-primary font-semibold text-sm transition-colors cursor-pointer select-none focus:outline-none"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Button
            type="submit"
            variant="amber"
            size="lg"
            loading={isSubmitting}
            rightIcon={<FiArrowRight className="w-4 h-4" />}
            className="px-8 h-12 text-white font-bold text-sm bg-[#fbab2a] hover:bg-[#e89b1f] rounded-xl shadow-md cursor-pointer"
          >
            Send Request
          </Button>
        </div>
      </form>

      <NsqConfirmationModal
        isOpen={isConfirmModalOpen}
        isLoading={isSubmitting}
        title="Are you sure?"
        subtitle="Confirm you want to send request to centre"
        confirmText="Yes, Send"
        cancelText="No"
        onConfirm={handleConfirmSendRequest}
        onClose={() => setIsConfirmModalOpen(false)}
      />
    </motion.div>
  );
};
