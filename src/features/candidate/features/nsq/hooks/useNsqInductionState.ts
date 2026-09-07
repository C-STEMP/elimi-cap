"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setNsqApplication } from "@/src/store/slices/onboardingSlice";
import {
  useGetTradesBySector,
  useGetUnitsByTrade,
  useGetSectors,
} from "@/src/features/shared/reference/hooks";
import {
  getCentresApi,
  getSectorsApi,
  getTradesBySectorApi,
} from "@/src/features/shared/reference/api";
import { useGetMeProfile } from "@/src/features/shared/account/hooks";
import { useUploadFile } from "@/src/features/shared/storage/hooks";
import {
  createApplicationApi,
  getApplicationsApi,
  submitApplicationApi,
  submitInductionFormApi,
} from "@/src/features/shared/applications/api";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks";
import { useCandidateProfileSignature } from "@/src/features/shared/onboarding/hooks";

export function useNsqInductionState() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saved = useAppSelector((state) => state.onboarding.nsqApplication);
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: meProfile } = useGetMeProfile();
  const { data: profileSignature } = useCandidateProfileSignature();
  const uploadFileMutation = useUploadFile();

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState(
    saved.firstName || meProfile?.personalDetails?.firstName || authUser?.fullName?.split(" ")[0] || "",
  );
  const [lastName, setLastName] = useState(
    saved.lastName || meProfile?.personalDetails?.lastName || authUser?.fullName?.split(" ").slice(1).join(" ") || "",
  );
  const [middleName, setMiddleName] = useState(saved.middleName || meProfile?.personalDetails?.middleName || "");
  const [registrationNo, setRegistrationNo] = useState(saved.registrationNo || "");
  const [tradeId, setTradeId] = useState(saved.tradeId || "");
  const [level, setLevel] = useState(saved.level || "Level 1");
  const [assessmentType, setAssessmentType] = useState(saved.assessmentType || "Specialized");
  const [courseStartDate, setCourseStartDate] = useState(saved.courseStartDate || new Date().toISOString().split("T")[0]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(saved.selectedUnitIds || []);
  const [highestQualification, setHighestQualification] = useState(saved.highestQualification || "");
  const [impairment, setImpairment] = useState(saved.impairment || "None");

  const [learningStrengths, setLearningStrengths] = useState<string[]>(
    saved.learningStrengths?.length ? saved.learningStrengths : ["Strong practical dexterity", "Quick comprehension of mechanical blueprints"],
  );
  const [newStrength, setNewStrength] = useState("");

  const [learningWeaknesses, setLearningWeaknesses] = useState<string[]>(
    saved.learningWeaknesses?.length ? saved.learningWeaknesses : ["Limited familiarity with computerized diagnostics"],
  );
  const [newWeakness, setNewWeakness] = useState("");

  const [passportAssetId, setPassportAssetId] = useState(saved.passportAssetId || "");
  const [passportPreview, setPassportPreview] = useState<string | null>(saved.passportPreview || saved.passportUrl || null);
  const [isSignatureAppended, setIsSignatureAppended] = useState(Boolean(saved.signatureAssetId));
  const [signatureAssetId, setSignatureAssetId] = useState(saved.signatureAssetId || "");
  const [signatureUrl, setSignatureUrl] = useState(saved.signatureUrl || "");

  const { data: remoteSectors = [] } = useGetSectors();
  const currentSectorId = saved.sectorId || (remoteSectors.length > 0 ? remoteSectors[0].id : "");
  const { data: remoteTrades = [] } = useGetTradesBySector(currentSectorId);
  const { data: remoteUnits = [] } = useGetUnitsByTrade(tradeId || saved.tradeId);

  return {
    router,
    dispatch,
    toast,
    queryClient,
    saved,
    authUser,
    meProfile,
    profileSignature,
    uploadFileMutation,
    isSignatureModalOpen,
    setIsSignatureModalOpen,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    isSubmitting,
    setIsSubmitting,
    createdAppId,
    setCreatedAppId,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    middleName,
    setMiddleName,
    registrationNo,
    setRegistrationNo,
    tradeId,
    setTradeId,
    level,
    setLevel,
    assessmentType,
    setAssessmentType,
    courseStartDate,
    setCourseStartDate,
    selectedUnitIds,
    setSelectedUnitIds,
    highestQualification,
    setHighestQualification,
    impairment,
    setImpairment,
    learningStrengths,
    setLearningStrengths,
    newStrength,
    setNewStrength,
    learningWeaknesses,
    setLearningWeaknesses,
    newWeakness,
    setNewWeakness,
    passportAssetId,
    setPassportAssetId,
    passportPreview,
    setPassportPreview,
    isSignatureAppended,
    setIsSignatureAppended,
    signatureAssetId,
    setSignatureAssetId,
    signatureUrl,
    setSignatureUrl,
    remoteTrades,
    remoteUnits,
  };
}
