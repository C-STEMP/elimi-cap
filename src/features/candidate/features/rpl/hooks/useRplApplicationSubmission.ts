"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  createApplicationApi,
  getApplicationsApi,
  getApplicationByIdApi,
  patchApplicationDraftApi,
  submitApplicationApi,
  withdrawApplicationApi,
} from "@/src/features/shared/applications/api";
import { APPLICATION_QUERY_KEYS } from "@/src/features/shared/applications/hooks";
import {
  getCentresApi,
  getSectorsApi,
  getTradesBySectorApi,
  getTradeDetailApi,
} from "@/src/features/shared/reference/api";
import {
  setCurrentApplication,
  updateApplicationStatus,
} from "@/store/slices/applicationSlice";
import {
  setPersonalInfo,
  setRPLExperienceTrade,
  setStartApplication,
  type PersonalInfoState,
  type RPLExperienceTradeState,
} from "@/store/slices/onboardingSlice";
import {
  getOnboardingPersonaApi,
  saveOnboardingApi,
} from "@/src/features/shared/onboarding/api";
import { ONBOARDING_QUERY_KEYS } from "@/src/features/shared/onboarding/hooks";
import { formatToIsoDate } from "@/src/lib/validation";
import {
  formatIsoToDisplayDate,
  mapEvidenceFlagsToLabels,
  normalizeGenderForForm,
} from "@/src/features/candidate/features/Application/utils/applicationDetailsHelpers";

export interface SaveDraftOverrides {
  personalInfo?: Partial<PersonalInfoState>;
  rplExp?: Partial<RPLExperienceTradeState>;
  declarations?: Record<string, boolean>;
}

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
    let wasWithdrawnForCentreChange = false;
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
        if (existingApp.status === "draft") {
          const existingCentreId =
            existingApp.centreId || (existingApp as any).centre?.id || "";
          const existingSectorId =
            existingApp.sectorId || (existingApp as any).sector?.id || "";
          const existingTradeId =
            existingApp.tradeId || (existingApp as any).trade?.id || "";
          const isChangingCentreOrTrade =
            (Boolean(startApp.assessmentCenter) &&
              Boolean(existingCentreId) &&
              existingCentreId !== startApp.assessmentCenter) ||
            (Boolean(startApp.sector) &&
              Boolean(existingSectorId) &&
              existingSectorId !== startApp.sector) ||
            (Boolean(startApp.trade) &&
              Boolean(existingTradeId) &&
              existingTradeId !== startApp.trade);

          if (isChangingCentreOrTrade) {
            await withdrawApplicationApi(existingApp.id);
            wasWithdrawnForCentreChange = true;
          } else {
            dispatch(setCurrentApplication(existingApp.id));
            return existingApp.id;
          }
        } else {
          dispatch(setCurrentApplication(existingApp.id));
          return existingApp.id;
        }
      }
    } catch {
      // Ignore network errors and continue to verification
    }

    // 2. If currentAppId exists in Redux and is not a fake local ID, verify it on the backend
    if (
      !wasWithdrawnForCentreChange &&
      currentAppId &&
      !currentAppId.startsWith("app-1")
    ) {
      try {
        const app = await getApplicationByIdApi(currentAppId);
        if (
          app?.id &&
          app.status !== "withdrawn" &&
          app.status !== "rejected" &&
          app.status !== "certified"
        ) {
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

    let qualificationLevelId = startApp.qualificationLevelId;
    if (!qualificationLevelId && tradeId) {
      try {
        const td = await getTradeDetailApi(tradeId);
        const qLevels =
          td?.activeNosDocument?.qualificationLevels ||
          (td as any)?.qualificationLevels ||
          [];
        const targetLvlNum =
          startApp.levelNumber ||
          (startApp.level ? parseInt(startApp.level, 10) : undefined);
        const matchedQl =
          qLevels.find(
            (ql: any) =>
              (targetLvlNum && ql.level === targetLvlNum) ||
              String(ql.level) === String(startApp.level) ||
              ql.id === startApp.level,
          ) ||
          qLevels.find((ql: any) => ql.level === 3) ||
          qLevels[0];
        if (matchedQl?.id) {
          qualificationLevelId = matchedQl.id;
          dispatch(
            setStartApplication({
              qualificationLevelId: matchedQl.id,
              levelNumber: matchedQl.level,
              level: String(matchedQl.level),
            }),
          );
        }
      } catch {
        // Ignore trade detail error
      }
    }

    // 4. Create draft application on backend
    try {
      const created = await createApplicationApi({
        type: "RPL",
        centreId,
        sectorId,
        tradeId,
        ...(qualificationLevelId ? { qualificationLevelId } : {}),
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
          (a) =>
            (a.type || "").toUpperCase() === "RPL" &&
            a.status !== "certified" &&
            a.status !== "rejected" &&
            a.status !== "withdrawn",
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

  const getHydratedPersonalInfo = async (
    overrideInfo?: Partial<PersonalInfoState>,
  ) => {
    let current: PersonalInfoState = {
      ...personalInfo,
      ...(overrideInfo || {}),
    };
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
          const prevAss = obData.previousAssessmentStatus;
          const hydrated: Partial<PersonalInfoState> = {
            firstName: current.firstName || pd?.firstName || "",
            lastName: current.lastName || pd?.lastName || "",
            middleName: current.middleName || pd?.middleName || "",
            dob: current.dob || formatIsoToDisplayDate(pd?.dob, false) || "",
            gender:
              current.gender || normalizeGenderForForm(pd?.gender) || "",
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
              current.impairment ||
              (acc?.hasImpairment === false
                ? "None / No impairment"
                : acc?.impairment || ""),
            completedBefore:
              current.completedBefore ||
              (typeof prevAss?.hasCompletedPreviousAssessment === "boolean"
                ? prevAss.hasCompletedPreviousAssessment
                  ? "yes"
                  : "no"
                : undefined),
            learnerId:
              current.learnerId ||
              (prevAss?.uniqueLearnerId && prevAss.uniqueLearnerId !== "Yes"
                ? prevAss.uniqueLearnerId
                : ""),
          };
          dispatch(setPersonalInfo(hydrated));
          current = { ...current, ...hydrated, ...(overrideInfo || {}) };
        }
      } catch {
        // Fall back to in-memory current
      }
    }
    return current;
  };

  const getHydratedExperienceAndTrade = async (
    appId?: string,
    overrideExp?: Partial<RPLExperienceTradeState>,
  ) => {
    let current: RPLExperienceTradeState = {
      ...rplExp,
      ...(overrideExp || {}),
    };
    const hasOccupation = Boolean(
      current.occupation && current.occupation.trim().length > 0,
    );
    const hasReason = Boolean(
      current.reasonRPL && current.reasonRPL.trim().length > 0,
    );

    if (!hasOccupation || !hasReason || !current.assessmentType) {
      try {
        const obRes = await getOnboardingPersonaApi("candidate");
        const obData = obRes?.data as any;
        if (obData) {
          const obOcc = obData.currentOccupation;
          const obRpl = obData.rplExperienceTrade;
          const prevAss = obData.previousAssessmentStatus;
          const patch: Partial<RPLExperienceTradeState> = {};

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
            (!current.employments ||
              current.employments.length === 0 ||
              (current.employments.length === 1 &&
                !current.employments[0].companyName &&
                !current.employments[0].jobTitle)) &&
            Array.isArray(obOcc?.employmentHistory) &&
            obOcc.employmentHistory.length > 0
          ) {
            patch.employments = obOcc.employmentHistory.map(
              (h: any, idx: number) => ({
                id: String(idx + 1),
                companyName: h.company || "",
                jobTitle: h.jobTitle || "",
                employmentType: h.employmentType || "Full-time",
                startDate: formatIsoToDisplayDate(h.startDate, true),
                endDate: formatIsoToDisplayDate(h.endDate, true),
                responsibilities: h.keyResponsibilities || "",
              }),
            );
          }

          if (
            typeof prevAss?.hasCompletedPreviousAssessment === "boolean" &&
            !overrideExp?.completedBefore
          ) {
            patch.completedBefore = prevAss.hasCompletedPreviousAssessment
              ? "Yes"
              : "No";
            if (
              prevAss.uniqueLearnerId &&
              prevAss.uniqueLearnerId !== "Yes" &&
              !current.previousAssessmentDetails
            ) {
              patch.previousAssessmentDetails = prevAss.uniqueLearnerId;
            }
          }

          if (Object.keys(patch).length > 0) {
            dispatch(setRPLExperienceTrade(patch));
            current = { ...current, ...patch, ...(overrideExp || {}) };
          }
        }
      } catch {
        // Fall back to application check
      }

      if (appId) {
        try {
          const app = await getApplicationByIdApi(appId);
          if (app) {
            const patch: Partial<RPLExperienceTradeState> = {};
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
            if (
              (!current.employments ||
                current.employments.length === 0 ||
                (current.employments.length === 1 &&
                  !current.employments[0].companyName &&
                  !current.employments[0].jobTitle)) &&
              Array.isArray(app.currentOccupation?.employmentHistory) &&
              app.currentOccupation.employmentHistory.length > 0
            ) {
              patch.employments = app.currentOccupation.employmentHistory.map(
                (h: any, idx: number) => ({
                  id: String(idx + 1),
                  companyName: h.company || "",
                  jobTitle: h.jobTitle || "",
                  employmentType: h.employmentType || "Full-time",
                  startDate: formatIsoToDisplayDate(h.startDate, true),
                  endDate: formatIsoToDisplayDate(h.endDate, true),
                  responsibilities: h.keyResponsibilities || "",
                }),
              );
            }
            if (
              (!current.individualUnit || current.individualUnit.length === 0) &&
              Array.isArray(app.unitIds) &&
              app.unitIds.length > 0 &&
              !overrideExp?.individualUnit
            ) {
              patch.individualUnit = app.unitIds;
            }
            if (!current.assessmentType && !overrideExp?.assessmentType) {
              if (Array.isArray(app.unitIds) && app.unitIds.length > 0) {
                patch.assessmentType = "Modular Assessment";
              } else if (
                app.currentOccupation ||
                app.reasonForSeekingRPL ||
                app.evidenceCandidateCanProvide
              ) {
                patch.assessmentType = "Full Qualification Assessment";
              }
            }
            if (
              (!current.selectedEvidence ||
                current.selectedEvidence.length === 0) &&
              app.evidenceCandidateCanProvide &&
              !overrideExp?.selectedEvidence
            ) {
              const mappedEv = mapEvidenceFlagsToLabels(
                app.evidenceCandidateCanProvide as any,
              );
              if (mappedEv.length > 0) {
                patch.selectedEvidence = mappedEv;
              }
            }
            if (Object.keys(patch).length > 0) {
              dispatch(setRPLExperienceTrade(patch));
              current = { ...current, ...patch, ...(overrideExp || {}) };
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
    overridePersonalInfo?: PersonalInfoState,
    overrideRplExp?: RPLExperienceTradeState,
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

    const isoDob = info.dob ? formatToIsoDate(info.dob) : "";
    const hasValidIsoDob = Boolean(isoDob && /^\d{4}-\d{2}-\d{2}$/.test(isoDob));

    if (
      includePersonalDetails &&
      !isIdentityLocked &&
      info.firstName &&
      info.lastName &&
      hasValidIsoDob
    ) {
      personalInformation.personalDetails = {
        firstName: info.firstName.trim(),
        lastName: info.lastName.trim(),
        middleName: info.middleName?.trim() || undefined,
        dob: isoDob,
        gender: info.gender || "Male",
        nationality: info.nationality || "Nigeria",
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
    const isModularAssessment = exp.assessmentType === "Modular Assessment";
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

    if (startApp.qualificationLevelId) {
      experienceAndTrade.qualificationLevelId = startApp.qualificationLevelId;
    }

    if (isFullAssessment) {
      experienceAndTrade.unitIds = [];
    } else if (isModularAssessment || validUnitIds.length > 0) {
      experienceAndTrade.unitIds = validUnitIds;
    }

    if (resolvedOccupation.length > 0) {
      const validEmploymentHistory = (exp.employments || [])
        .map((emp) => {
          const startIso = emp.startDate ? formatToIsoDate(emp.startDate) : "";
          const endIso = (emp as any).endDate
            ? formatToIsoDate((emp as any).endDate)
            : "";
          return {
            emp,
            startIso,
            endIso,
          };
        })
        .filter(
          ({ emp, startIso }) =>
            emp.companyName?.trim() &&
            (emp.jobTitle?.trim() || resolvedOccupation) &&
            /^\d{4}-\d{2}-\d{2}$/.test(startIso),
        )
        .map(({ emp, startIso, endIso }) => {
          const item: Record<string, unknown> = {
            company: emp.companyName.trim(),
            jobTitle: emp.jobTitle?.trim() || resolvedOccupation,
            employmentType: emp.employmentType || "Full-time",
            startDate: startIso,
            keyResponsibilities: emp.responsibilities?.trim() || "N/A",
          };
          if (endIso && /^\d{4}-\d{2}-\d{2}$/.test(endIso)) {
            item.endDate = endIso;
          }
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

    if (
      Array.isArray(exp.selectedEvidence) &&
      (exp.selectedEvidence.length > 0 ||
        Boolean(exp.assessmentType) ||
        Boolean(resolvedReason) ||
        Boolean(exp.occupation?.trim()))
    ) {
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

    const effectiveDeclarations = customDeclarations || exp.declarations;

    const payload: Record<string, unknown> = {
      assessmentDeclaration: {
        infoProvidedIsAccurate: Boolean(
          effectiveDeclarations?.trueAndAccurate ?? true,
        ),
        understandsDoesNotGuaranteeCertification: Boolean(
          effectiveDeclarations?.noGuarantee ?? true,
        ),
        understandsThatNeedsToProvideSufficientEvidenceToDemonstrateCompetence:
          Boolean(effectiveDeclarations?.sufficientEvidence ?? true),
        agreesToTermsAndPrivacyPolicy: Boolean(
          effectiveDeclarations?.agreeTerms ?? true,
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
   * Persists candidate onboarding fields (including accessibility & previousAssessmentStatus)
   * to `PATCH /onboarding/candidate/save`
   */
  const persistCandidateOnboardingDraft = async (
    info: PersonalInfoState,
    exp: RPLExperienceTradeState,
    builtPatchPayload: Record<string, any>,
  ) => {
    const onboardingData: Record<string, unknown> = {};
    const pInfo = builtPatchPayload.personalInformation as
      | Record<string, unknown>
      | undefined;
    const expInfo = builtPatchPayload.experienceAndTrade as
      | Record<string, unknown>
      | undefined;

    if (pInfo?.personalDetails) {
      onboardingData.personalDetails = pInfo.personalDetails;
    }
    if (pInfo?.contactInformation) {
      onboardingData.contactInformation = pInfo.contactInformation;
    }
    if (pInfo?.residentialAddress) {
      onboardingData.residentialAddress = pInfo.residentialAddress;
    }
    if (expInfo?.currentOccupation) {
      onboardingData.currentOccupation = expInfo.currentOccupation;
    }

    const rawImp = (info.impairment || "").trim();
    if (rawImp) {
      const isNone =
        rawImp === "None / No impairment" ||
        rawImp === "None" ||
        rawImp === "No";
      onboardingData.accessibility = isNone
        ? { hasImpairment: false }
        : { hasImpairment: true, impairment: rawImp };
    }

    const completedRaw = (
      info.completedBefore ||
      exp.completedBefore ||
      ""
    )
      .trim()
      .toLowerCase();
    if (completedRaw === "yes" || completedRaw === "no") {
      const hasCompleted = completedRaw === "yes";
      const uln = (
        info.learnerId ||
        exp.previousAssessmentDetails ||
        ""
      ).trim();
      onboardingData.previousAssessmentStatus = hasCompleted
        ? {
            hasCompletedPreviousAssessment: true,
            uniqueLearnerId: uln || "Yes",
          }
        : { hasCompletedPreviousAssessment: false };
    }

    if (Object.keys(onboardingData).length === 0) return;

    try {
      await saveOnboardingApi({
        persona: "candidate",
        data: onboardingData,
      });
    } catch (err: any) {
      const msg = err?.message || "";
      if (
        (msg.includes("identity_fields_locked") ||
          err?.details?.some?.(
            (d: any) => d.issue === "identity_fields_locked",
          )) &&
        onboardingData.personalDetails
      ) {
        const retryData = { ...onboardingData };
        delete retryData.personalDetails;
        if (Object.keys(retryData).length > 0) {
          await saveOnboardingApi({
            persona: "candidate",
            data: retryData,
          }).catch(() => {});
        }
      }
    }
  };

  /**
   * Save draft application to backend & sync Redux
   */
  const saveDraft = async (overrides?: SaveDraftOverrides) => {
    const appId = await ensureDraftApplicationId();
    const [hydratedInfo, hydratedExp] = await Promise.all([
      getHydratedPersonalInfo(overrides?.personalInfo),
      getHydratedExperienceAndTrade(appId, overrides?.rplExp),
    ]);
    const payload = buildPatchPayload(
      overrides?.declarations,
      true,
      hydratedInfo,
      hydratedExp,
    );

    await persistCandidateOnboardingDraft(hydratedInfo, hydratedExp, payload);

    try {
      await patchApplicationDraftApi(appId, payload);
    } catch (err: any) {
      const msg = err?.message || "";
      if (
        msg.includes("identity_fields_locked") ||
        err?.details?.some?.((d: any) => d.issue === "identity_fields_locked")
      ) {
        const retryPayload = buildPatchPayload(
          overrides?.declarations,
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

    // Invalidate queries so returning to any step or dashboard reflects fresh backend state
    queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEYS.all });
    queryClient.invalidateQueries({
      queryKey: APPLICATION_QUERY_KEYS.detail(appId),
    });
    queryClient.invalidateQueries({
      queryKey: ONBOARDING_QUERY_KEYS.persona("candidate"),
    });

    return appId;
  };

  /**
   * Submit application to backend & sync Redux
   */
  const submitApplication = async (
    declarations?: Record<string, boolean>,
    overrides?: SaveDraftOverrides,
  ) => {
    const appId = await ensureDraftApplicationId();
    const [hydratedInfo, hydratedExp] = await Promise.all([
      getHydratedPersonalInfo(overrides?.personalInfo),
      getHydratedExperienceAndTrade(appId, overrides?.rplExp),
    ]);
    const payload = buildPatchPayload(
      declarations || overrides?.declarations,
      true,
      hydratedInfo,
      hydratedExp,
    );

    await persistCandidateOnboardingDraft(hydratedInfo, hydratedExp, payload);

    try {
      await patchApplicationDraftApi(appId, payload);
    } catch (err: any) {
      const msg = err?.message || "";
      if (
        msg.includes("identity_fields_locked") ||
        err?.details?.some?.((d: any) => d.issue === "identity_fields_locked")
      ) {
        const retryPayload = buildPatchPayload(
          declarations || overrides?.declarations,
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
    queryClient.invalidateQueries({
      queryKey: APPLICATION_QUERY_KEYS.detail(appId),
    });
    queryClient.invalidateQueries({
      queryKey: ONBOARDING_QUERY_KEYS.persona("candidate"),
    });

    return appId;
  };

  return {
    saveDraft,
    submitApplication,
  };
}
