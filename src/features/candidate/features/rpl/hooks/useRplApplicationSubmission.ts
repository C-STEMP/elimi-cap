"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  createApplicationApi,
  getApplicationsApi,
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
  createApplication as createApplicationSlice,
  setCurrentApplication,
  updateApplicationStatus,
} from "@/store/slices/applicationSlice";
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
      const existingDraft = existing.find(
        (a) =>
          a.type === "RPL" &&
          (a.status === "draft" || a.status === "in_progress"),
      );
      if (existingDraft?.id) {
        dispatch(setCurrentApplication(existingDraft.id));
        return existingDraft.id;
      }
    } catch {
      // Ignore network errors and continue to creation
    }

    // 2. Resolve centreId, sectorId, tradeId
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
        // Fallback IDs if catalogue request fails
      }
    }

    if (!centreId) centreId = "centre-1";
    if (!sectorId) sectorId = "sector-1";
    if (!tradeId) tradeId = "trade-1";

    // 3. Create draft application on backend
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
        dispatch(
          createApplicationSlice({
            title:
              created.trade?.name ||
              (!rplExp.qualificationTitle?.match(/^[0-9A-Z]{20,}$/) &&
                rplExp.qualificationTitle) ||
              startApp.tradeName ||
              "RPL Application",
            subtitle:
              created.sector?.name ||
              startApp.sectorName ||
              "Recognition of Prior Learning",
          }),
        );
        return created.id;
      }
    } catch (err: any) {
      // If 409 conflict, refetch to get existing draft ID
      const msg = err?.message?.toLowerCase() || "";
      if (msg.includes("already") || err?.statusCode === 409) {
        const existing = await getApplicationsApi().catch(() => []);
        const found = existing.find((a) => a.type === "RPL");
        if (found?.id) {
          dispatch(setCurrentApplication(found.id));
          return found.id;
        }
      }
    }

    const fallbackId = currentAppId || `app-${Date.now()}`;
    dispatch(setCurrentApplication(fallbackId));
    dispatch(
      createApplicationSlice({
        title:
          (!rplExp.qualificationTitle?.match(/^[0-9A-Z]{20,}$/) &&
            rplExp.qualificationTitle) ||
          startApp.tradeName ||
          "RPL Application",
        subtitle:
          startApp.sectorName || "Recognition of Prior Learning",
      }),
    );
    return fallbackId;
  };

  /**
   * Builds the comprehensive patch payload from current form state
   */
  const buildPatchPayload = (
    customDeclarations?: Record<string, boolean>,
    includePersonalDetails = true,
  ) => {
    const rawYears = rplExp.yearsOfExperience;
    let yearsNum = 0;
    if (typeof rawYears === "number") {
      yearsNum = isNaN(rawYears) ? 0 : Math.max(0, Math.floor(rawYears));
    } else if (typeof rawYears === "string") {
      const match = rawYears.match(/\d+/);
      yearsNum = match ? Math.max(0, parseInt(match[0], 10)) : 0;
    }

    const isIdentityLocked = Boolean(
      authUser?.isVerified ||
      rplIdentity?.isVerified
    );

    const personalInformation: Record<string, unknown> = {
      contactInformation: {
        emailAddress: personalInfo.email || authUser?.email || "",
        phoneNumber: {
          countryCode: "+234",
          number: personalInfo.phoneNumber || "08012345678",
        },
      },
      residentialAddress: {
        country: personalInfo.country || "Nigeria",
        state: personalInfo.state || "Lagos",
        lga: personalInfo.lga || "Ikeja",
        address: personalInfo.streetAddress || "Street Address",
      },
    };

    if (includePersonalDetails && !isIdentityLocked && personalInfo.firstName) {
      personalInformation.personalDetails = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        middleName: personalInfo.middleName || undefined,
        dob: formatToIsoDate(personalInfo.dob) || "2000-01-01",
        gender: personalInfo.gender || "male",
        nationality: personalInfo.nationality || "Nigerian",
      };
    }

    const resolvedOccupation =
      rplExp.occupation ||
      (!rplExp.qualificationTitle?.match(/^[0-9A-Z]{20,}$/) &&
        rplExp.qualificationTitle) ||
      startApp.tradeName ||
      "Cosmetologist";

    // Sanitize unitIds: if Full Assessment, send []; if Modular Assessment, only send valid ID strings
    const isFullAssessment =
      rplExp.assessmentType === "Full Qualification Assessment";
    let validUnitIds: string[] = [];

    if (!isFullAssessment && Array.isArray(rplExp.individualUnit)) {
      validUnitIds = rplExp.individualUnit.filter((u) => {
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

    return {
      personalInformation,
      experienceAndTrade: {
        unitIds: validUnitIds,
        currentOccupation: {
          occupation: resolvedOccupation,
          yearsOfExperience: yearsNum,
          employmentHistory: (rplExp.employments && rplExp.employments.length > 0
            ? rplExp.employments
            : [
                {
                  id: "emp-1",
                  companyName: "Self-Employed",
                  jobTitle: resolvedOccupation,
                  employmentType: "Full-time",
                  startDate: "2020-01-01",
                  endDate: "",
                  responsibilities: "Trade duties",
                },
              ]
          ).map((emp) => ({
            company: emp.companyName || "Self-Employed",
            jobTitle: emp.jobTitle || resolvedOccupation,
            employmentType: emp.employmentType || "Full-time",
            startDate:
              formatToIsoDate(emp.startDate) || "2020-01-01",
            endDate: (emp as any).endDate
              ? formatToIsoDate((emp as any).endDate)
              : undefined,
            keyResponsibilities: emp.responsibilities || "Trade duties",
          })),
        },
        reasonForSeekingRPL: rplExp.reasonRPL || "Certification of skills",
        evidenceCandidateCanProvide: {
          resume: Boolean(
            rplExp.selectedEvidence?.includes("Resume / CV") ||
              rplExp.selectedEvidence?.includes("Resume"),
          ),
          workSamples: Boolean(
            rplExp.selectedEvidence?.includes("Work samples") ||
              rplExp.selectedEvidence?.includes("Work Samples"),
          ),
          employmentLetter: Boolean(
            rplExp.selectedEvidence?.includes("Employment Letter") ||
              rplExp.selectedEvidence?.includes("Employment letter"),
          ),
          certificates: Boolean(
            rplExp.selectedEvidence?.includes("Certificates") ||
              rplExp.selectedEvidence?.includes(
                "Certificates / Statements of Attainment",
              ),
          ),
          statementsOfAttainment: Boolean(
            rplExp.selectedEvidence?.includes("Statements of Attainment") ||
              rplExp.selectedEvidence?.includes("Statements of attainment"),
          ),
          thirdPartyReportsOrReferences: Boolean(
            rplExp.selectedEvidence?.includes("Reference letters") ||
              rplExp.selectedEvidence?.includes("References") ||
              rplExp.selectedEvidence?.includes(
                "References / Third-Party Reports",
              ),
          ),
          jobDescriptions: Boolean(
            rplExp.selectedEvidence?.includes("Job Descriptions") ||
              rplExp.selectedEvidence?.includes("Job descriptions"),
          ),
          photosOrVideosOfWork: Boolean(
            rplExp.selectedEvidence?.includes("Photos / Videos of work") ||
              rplExp.selectedEvidence?.includes("Photos / Videos of Work") ||
              rplExp.selectedEvidence?.includes("Photos / Videos"),
          ),
          other: Boolean(
            rplExp.selectedEvidence?.includes("Other") ||
              Boolean(rplExp.otherEvidenceText?.trim()),
          ),
        },
      },
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
  };

  /**
   * Save draft application to backend & sync Redux
   */
  const saveDraft = async () => {
    const appId = await ensureDraftApplicationId();
    const payload = buildPatchPayload();

    try {
      await patchApplicationDraftApi(appId, payload);
    } catch (err: any) {
      const msg = err?.message || "";
      if (
        msg.includes("identity_fields_locked") ||
        err?.details?.some?.((d: any) => d.issue === "identity_fields_locked")
      ) {
        const retryPayload = buildPatchPayload(undefined, false);
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
    const payload = buildPatchPayload(declarations);

    try {
      await patchApplicationDraftApi(appId, payload);
    } catch (err: any) {
      const msg = err?.message || "";
      if (
        msg.includes("identity_fields_locked") ||
        err?.details?.some?.((d: any) => d.issue === "identity_fields_locked")
      ) {
        const retryPayload = buildPatchPayload(declarations, false);
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
