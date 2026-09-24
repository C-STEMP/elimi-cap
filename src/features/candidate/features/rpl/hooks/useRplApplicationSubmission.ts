"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  createApplicationApi,
  getApplicationsApi,
  getApplicationByIdApi,
  patchApplicationDraftApi,
  submitApplicationApi,
} from "@/src/features/shared/applications/api";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks";
import {
  getCentresApi,
  getSectorsApi,
  getTradesBySectorApi,
} from "@/src/features/shared/reference/api";
import {
  setCurrentApplication,
  updateApplicationStatus,
} from "@/store/slices/applicationSlice";
import {
  setPersonalInfo,
  setRPLExperienceTrade,
} from "@/store/slices/onboardingSlice";
import { getOnboardingPersonaApi } from "@/src/features/shared/onboarding/api";
import { formatToIsoDate } from "@/src/lib/validation";

export function useRplApplicationSubmission() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const authUser = useAppSelector((state) => state.auth.user);
  const startApp = useAppSelector((state) => state.onboarding.startApplication);
  const personalInfo = useAppSelector((state) => state.onboarding.personalInfo);
  const rplExp = useAppSelector((state) => state.onboarding.rplExperienceTrade);
  const rplIdentity = useAppSelector((state) => state.onboarding.rplIdentity);
  const currentAppId = useAppSelector(
    (state) => state.application.currentApplicationId,
  );

  /**
   * Resolves or creates a draft RPL application ID on the backend
   */
  const ensureDraftApplicationId = async (): Promise<string> => {
    // 1. Check existing applications from backend
    try {
      const existing = await getApplicationsApi();
      const existingApp = existing.find(
        (a) =>
          (a.type || "").toUpperCase() === "RPL" &&
          a.status !== "certified" &&
          a.status !== "rejected" &&
          a.status !== "withdrawn",
      );
      if (existingApp?.id) {
        dispatch(setCurrentApplication(existingApp.id));
        return existingApp.id;
      }
    } catch {
      // Ignore network errors and continue to verification
    }

    // 2. If currentAppId exists in Redux and is not a fake local ID, verify it on the backend
    if (currentAppId && !currentAppId.startsWith("app-1")) {
      try {
        const app = await getApplicationByIdApi(currentAppId);
        if (app?.id) {
          return app.id;
        }
      } catch {
        // App not found, continue to creation
      }
    }

    // 3. Resolve centreId, sectorId, tradeId from store or catalogues
    let centreId = startApp.assessmentCenter;
    let sectorId = startApp.sector;
    let tradeId = startApp.trade;

    if (!centreId || !sectorId || !tradeId) {
      try {
        const [centres, sectors] = await Promise.all([
          getCentresApi(),
          getSectorsApi(),
        ]);
        if (!centreId && centres.length > 0) centreId = centres[0].id;
        if (!sectorId && sectors.length > 0) sectorId = sectors[0].id;
        if (sectorId && !tradeId) {
          const trades = await getTradesBySectorApi(sectorId);
          if (trades.length > 0) tradeId = trades[0].id;
        }
      } catch {
        // Catalogue request failed
      }
    }

    if (!centreId || !sectorId || !tradeId) {
      throw new Error(
        "Please select your Assessment Centre, Sector, and Trade before submitting.",
      );
    }

    // 4. Create draft application on backend
    try {
      const created = await createApplicationApi({
        type: "RPL",
        centreId,
        sectorId,
        tradeId,
        unitIds: [],
      });

      if (created?.id) {
        dispatch(setCurrentApplication(created.id));
        return created.id;
      }
    } catch (err: any) {
      // If 409 conflict ("already exists"), refetch applications to find the existing one
      const msg = err?.message?.toLowerCase() || "";
      if (
        msg.includes("already") ||
        err?.statusCode === 409 ||
        err?.status === 409
      ) {
        const existing = await getApplicationsApi().catch(() => []);
        const found = existing.find(
          (a) => (a.type || "").toUpperCase() === "RPL",
        );
        if (found?.id) {
          dispatch(setCurrentApplication(found.id));
          return found.id;
        }
      }
      throw err;
    }

    throw new Error(
      "Unable to create or find an RPL application on the server.",
    );
  };

  const getHydratedPersonalInfo = async () => {
    let current = { ...personalInfo };
    if (
      !current.phoneNumber ||
      !current.state ||
      !current.streetAddress ||
      !current.firstName
    ) {
      try {
        const obRes = await getOnboardingPersonaApi("candidate");
        const obData = obRes?.data as any;
        if (obData) {
          const pd = obData.personalDetails;
          const ci = obData.contactInformation;
          const ra = obData.residentialAddress;
          const acc = obData.accessibility;
          const hydrated = {
            firstName: current.firstName || pd?.firstName || "",
            lastName: current.lastName || pd?.lastName || "",
            middleName: current.middleName || pd?.middleName || "",
            dob: current.dob || pd?.dob || "",
            gender: current.gender || pd?.gender || "",
            nationality: current.nationality || pd?.nationality || "",
            email:
              current.email ||
              ci?.emailAddress ||
              authUser?.email ||
              "",
            phoneNumber:
              current.phoneNumber ||
              ci?.phoneNumber?.number ||
              "",
            country:
              current.country || ra?.country || "Nigeria",
            state: current.state || ra?.state || "",
            lga: current.lga || ra?.lga || "",
            streetAddress:
              current.streetAddress || ra?.address || "",
            impairment:
              current.impairment || acc?.impairment || "",
          };
          dispatch(setPersonalInfo(hydrated));
          current = { ...current, ...hydrated };
        }
      } catch {
        // Fall back to in-memory current
      }
    }
    return current;
  };

  const getHydratedExperienceAndTrade = async (appId?: string) => {
    let current = { ...rplExp };
    const hasOccupation = Boolean(
      current.occupation && current.occupation.trim().length > 0,
    );
    const hasReason = Boolean(
      current.reasonRPL && current.reasonRPL.trim().length > 0,
    );

    if (!hasOccupation || !hasReason) {
      try {
        const obRes = await getOnboardingPersonaApi("candidate");
        const obData = obRes?.data as any;
        if (obData) {
          const obOcc = obData.currentOccupation;
          const obRpl = obData.rplExperienceTrade;
          const patch: Partial<typeof rplExp> = {};

          if (!hasOccupation) {
            const occ =
              obOcc?.occupation ||
              obRpl?.occupation ||
              startApp.tradeName ||
              "";
            if (occ) patch.occupation = occ;
          }

          if (!hasReason) {
            const reason =
              obRpl?.reasonRPL ||
              obOcc?.reasonForSeekingRPL ||
              obData.reasonForSeekingRPL ||
              "";
            if (reason) patch.reasonRPL = reason;
          }

          if (
            !current.yearsOfExperience &&
            obOcc?.yearsOfExperience !== undefined
          ) {
            patch.yearsOfExperience = String(obOcc.yearsOfExperience);
          }

          if (
            (!current.employments || current.employments.length === 0) &&
            Array.isArray(obOcc?.employmentHistory) &&
            obOcc.employmentHistory.length > 0
          ) {
            patch.employments = obOcc.employmentHistory.map(
              (h: any, idx: number) => ({
                id: String(idx + 1),
                companyName: h.company || "",
                jobTitle: h.jobTitle || "",
                employmentType: h.employmentType || "Full-time",
                startDate: h.startDate || "",
                endDate: h.endDate || "",
                responsibilities: h.keyResponsibilities || "",
              }),
            );
          }

          if (Object.keys(patch).length > 0) {
            dispatch(setRPLExperienceTrade(patch));
            current = { ...current, ...patch };
          }
        }
      } catch {
        // Fall back to application check
      }

      if (appId && (!current.occupation || !current.reasonRPL)) {
        try {
          const app = await getApplicationByIdApi(appId);
          if (app) {
            const patch: Partial<typeof rplExp> = {};
            if (
              !current.occupation &&
              (app.currentOccupation?.occupation || app.trade?.name)
            ) {
              patch.occupation =
                app.currentOccupation?.occupation || app.trade?.name || "";
            }
            if (!current.reasonRPL && app.reasonForSeekingRPL) {
              patch.reasonRPL = app.reasonForSeekingRPL;
            }
            if (
              !current.yearsOfExperience &&
              app.currentOccupation?.yearsOfExperience !== undefined
            ) {
              patch.yearsOfExperience = String(
                app.currentOccupation.yearsOfExperience,
              );
            }
            if (Object.keys(patch).length > 0) {
              dispatch(setRPLExperienceTrade(patch));
              current = { ...current, ...patch };
            }
          }
        } catch {
          // Ignore
        }
      }
    }
    return current;
  };

  /**
   * Builds the comprehensive patch payload from current form state
   */
  const buildPatchPayload = (
    customDeclarations?: Record<string, boolean>,
    includePersonalDetails = true,
    overridePersonalInfo?: typeof personalInfo,
    overrideRplExp?: typeof rplExp,
  ) => {
    const info = overridePersonalInfo || personalInfo;
    const exp = overrideRplExp || rplExp;

    const rawYears = exp.yearsOfExperience;
    let yearsNum = 0;
    if (typeof rawYears === "number") {
      yearsNum = isNaN(rawYears) ? 0 : Math.max(0, Math.floor(rawYears));
    } else if (typeof rawYears === "string") {
      const match = rawYears.match(/\d+/);
      yearsNum = match ? Math.max(0, parseInt(match[0], 10)) : 0;
    }

    const isIdentityLocked = Boolean(
      authUser?.isVerified || rplIdentity?.isVerified,
    );

    const hasPhone = Boolean(
      info.phoneNumber && info.phoneNumber.trim().length > 0,
    );
    const hasAddress = Boolean(
      info.state &&
        info.streetAddress &&
        info.state.trim().length > 0 &&
        info.streetAddress.trim().length > 0,
    );

    const personalInformation: Record<string, unknown> = {};

    if (hasPhone) {
      personalInformation.contactInformation = {
        emailAddress: info.email || authUser?.email || "",
        phoneNumber: {
          countryCode: "+234",
          number: info.phoneNumber.trim(),
        },
      };
    }

    if (hasAddress) {
      personalInformation.residentialAddress = {
        country: info.country || "Nigeria",
        state: info.state.trim(),
        lga: info.lga?.trim() || undefined,
        address: info.streetAddress.trim(),
      };
    }

    if (
      includePersonalDetails &&
      !isIdentityLocked &&
      info.firstName &&
      info.lastName &&
      info.dob
    ) {
      personalInformation.personalDetails = {
        firstName: info.firstName.trim(),
        lastName: info.lastName.trim(),
        middleName: info.middleName?.trim() || undefined,
        dob: formatToIsoDate(info.dob),
        gender: info.gender || "male",
        nationality: info.nationality || "Nigerian",
      };
    }

    const resolvedOccupation = (
      exp.occupation?.trim() ||
      (!exp.qualificationTitle?.match(/^[0-9A-Z]{20,}$/) &&
        exp.qualificationTitle?.trim()) ||
      startApp.tradeName?.trim() ||
      ""
    );

    // Sanitize unitIds: if Full Assessment, send []; if Modular Assessment, only send valid ID strings
    const isFullAssessment =
      exp.assessmentType === "Full Qualification Assessment";
    let validUnitIds: string[] = [];

    if (!isFullAssessment && Array.isArray(exp.individualUnit)) {
      validUnitIds = exp.individualUnit.filter((u) => {
        if (!u || typeof u !== "string") return false;
        const trimmed = u.trim();
        if (
          trimmed.includes(" ") ||
          trimmed.includes(":") ||
          trimmed.startsWith("Unit")
        ) {
          return false;
        }
        return trimmed.length >= 10;
      });
    }

    const experienceAndTrade: Record<string, unknown> = {};

    if (validUnitIds.length > 0) {
      experienceAndTrade.unitIds = validUnitIds;
    }

    if (resolvedOccupation.length > 0) {
      const validEmploymentHistory = (exp.employments || [])
        .filter(
          (emp) =>
            emp.companyName?.trim() &&
            (emp.jobTitle?.trim() || resolvedOccupation),
        )
        .map((emp) => {
          const item: Record<string, unknown> = {
            company: emp.companyName.trim(),
            jobTitle: emp.jobTitle?.trim() || resolvedOccupation,
            employmentType: emp.employmentType || "Full-time",
            keyResponsibilities: emp.responsibilities?.trim() || "N/A",
          };
          const startIso = formatToIsoDate(emp.startDate);
          if (startIso) item.startDate = startIso;
          const endIso = (emp as any).endDate
            ? formatToIsoDate((emp as any).endDate)
            : undefined;
          if (endIso) item.endDate = endIso;
          return item;
        });

      experienceAndTrade.currentOccupation = {
        occupation: resolvedOccupation,
        yearsOfExperience: yearsNum,
        employmentHistory: validEmploymentHistory,
      };
    }

    const resolvedReason = (exp.reasonRPL || "").trim();
    if (resolvedReason.length > 0) {
      experienceAndTrade.reasonForSeekingRPL = resolvedReason;
    }

    if (exp.selectedEvidence && exp.selectedEvidence.length > 0) {
      experienceAndTrade.evidenceCandidateCanProvide = {
        resume: Boolean(
          exp.selectedEvidence.includes("Resume / CV") ||
            exp.selectedEvidence.includes("Resume"),
        ),
        workSamples: Boolean(
          exp.selectedEvidence.includes("Work samples") ||
            exp.selectedEvidence.includes("Work Samples"),
        ),
        employmentLetter: Boolean(
          exp.selectedEvidence.includes("Employment Letter") ||
            exp.selectedEvidence.includes("Employment letter"),
        ),
        certificates: Boolean(
          exp.selectedEvidence.includes("Certificates") ||
            exp.selectedEvidence.includes(
              "Certificates / Statements of Attainment",
            ),
        ),
        statementsOfAttainment: Boolean(
          exp.selectedEvidence.includes("Statements of Attainment") ||
            exp.selectedEvidence.includes("Statements of attainment"),
        ),
        thirdPartyReportsOrReferences: Boolean(
          exp.selectedEvidence.includes("Reference letters") ||
            exp.selectedEvidence.includes("References") ||
            exp.selectedEvidence.includes(
              "References / Third-Party Reports",
            ),
        ),
        jobDescriptions: Boolean(
          exp.selectedEvidence.includes("Job Descriptions") ||
            exp.selectedEvidence.includes("Job descriptions"),
        ),
        photosOrVideosOfWork: Boolean(
          exp.selectedEvidence.includes("Photos / Videos of work") ||
            exp.selectedEvidence.includes("Photos / Videos of Work") ||
            exp.selectedEvidence.includes("Photos / Videos"),
        ),
        other: Boolean(
          exp.selectedEvidence.includes("Other") ||
            Boolean(exp.otherEvidenceText?.trim()),
        ),
      };
    }

    const payload: Record<string, unknown> = {
      assessmentDeclaration: {
        infoProvidedIsAccurate: Boolean(
          customDeclarations?.trueAndAccurate ?? true,
        ),
        understandsDoesNotGuaranteeCertification: Boolean(
          customDeclarations?.noGuarantee ?? true,
        ),
        understandsThatNeedsToProvideSufficientEvidenceToDemonstrateCompetence:
          Boolean(customDeclarations?.sufficientEvidence ?? true),
        agreesToTermsAndPrivacyPolicy: Boolean(
          customDeclarations?.agreeTerms ?? true,
        ),
      },
    };

    if (Object.keys(personalInformation).length > 0) {
      payload.personalInformation = personalInformation;
    }

    if (Object.keys(experienceAndTrade).length > 0) {
      payload.experienceAndTrade = experienceAndTrade;
    }

    return payload;
  };

  /**
   * Save draft application to backend & sync Redux
   */
  const saveDraft = async () => {
    const appId = await ensureDraftApplicationId();
    const [hydratedInfo, hydratedExp] = await Promise.all([
      getHydratedPersonalInfo(),
      getHydratedExperienceAndTrade(appId),
    ]);
    const payload = buildPatchPayload(
      undefined,
      true,
      hydratedInfo,
      hydratedExp,
    );

    try {
      await patchApplicationDraftApi(appId, payload);
    } catch (err: any) {
      const msg = err?.message || "";
      if (
        msg.includes("identity_fields_locked") ||
        err?.details?.some?.((d: any) => d.issue === "identity_fields_locked")
      ) {
        const retryPayload = buildPatchPayload(
          undefined,
          false,
          hydratedInfo,
          hydratedExp,
        );
        await patchApplicationDraftApi(appId, retryPayload).catch(() => {});
      } else {
        const issues = err?.details
          ?.map?.((d: any) => d.issue || d.message)
          .filter(Boolean);
        const combinedMsg =
          (issues && issues.length > 0 ? issues.join(". ") : "") ||
          err?.message ||
          "Failed to update application draft";
        const errorObj = new Error(combinedMsg);
        (errorObj as any).code = err?.code;
        (errorObj as any).details = err?.details;
        throw errorObj;
      }
    }

    // Invalidate queries so dashboard reflects newly created/saved draft
    queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });

    return appId;
  };

  /**
   * Submit application to backend & sync Redux
   */
  const submitApplication = async (declarations?: Record<string, boolean>) => {
    const appId = await ensureDraftApplicationId();
    const [hydratedInfo, hydratedExp] = await Promise.all([
      getHydratedPersonalInfo(),
      getHydratedExperienceAndTrade(appId),
    ]);
    const payload = buildPatchPayload(
      declarations,
      true,
      hydratedInfo,
      hydratedExp,
    );

    try {
      await patchApplicationDraftApi(appId, payload);
    } catch (err: any) {
      const msg = err?.message || "";
      if (
        msg.includes("identity_fields_locked") ||
        err?.details?.some?.((d: any) => d.issue === "identity_fields_locked")
      ) {
        const retryPayload = buildPatchPayload(
          declarations,
          false,
          hydratedInfo,
          hydratedExp,
        );
        await patchApplicationDraftApi(appId, retryPayload).catch(() => {});
      } else {
        const issues = err?.details
          ?.map?.((d: any) => d.issue || d.message)
          .filter(Boolean);
        const combinedMsg =
          (issues && issues.length > 0 ? issues.join(". ") : "") ||
          err?.message ||
          "Failed to update application draft";
        const errorObj = new Error(combinedMsg);
        (errorObj as any).code = err?.code;
        (errorObj as any).details = err?.details;
        throw errorObj;
      }
    }

    try {
      await submitApplicationApi(appId);
    } catch (err: any) {
      console.error("submitApplicationApi error:", err);
      const issues = err?.details
        ?.map?.((d: any) => d.issue || d.message)
        .filter(Boolean);
      const combinedMsg =
        (issues && issues.length > 0 ? issues.join(". ") : "") ||
        err?.message ||
        "Failed to submit application";
      const errorObj = new Error(combinedMsg);
      (errorObj as any).code = err?.code;
      (errorObj as any).details = err?.details;
      throw errorObj;
    }

    dispatch(
      updateApplicationStatus({
        id: appId,
        status: "submitted",
      }),
    );

    queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });

    return appId;
  };

  return {
    saveDraft,
    submitApplication,
  };
}
