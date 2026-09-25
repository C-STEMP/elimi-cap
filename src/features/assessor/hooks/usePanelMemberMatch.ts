import { useCallback } from "react";
import { useAppSelector } from "@/src/store/hooks";
import { useGetMeProfile } from "@/src/features/shared/account/hooks";
import { useGetAssessorProfile } from "./useAssessor";

/**
 * Returns a matcher telling whether an interview panel member is the signed-in
 * assessor, using every identifier we know for them (user id, assessor
 * profile id, email, names). Shared so the application page and the
 * assessment-form page agree on who the lead panelist is.
 */
export function usePanelMemberMatch() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: meProfile } = useGetMeProfile();
  const { data: assessorProfile } = useGetAssessorProfile();

  const currentUserId = (user?.id || user?.userId || (user as any)?._id || "")
    .toString()
    .toLowerCase()
    .trim();
  const currentAssessorId = (
    assessorProfile?.id ||
    (assessorProfile as any)?.assessorId ||
    ""
  )
    .toString()
    .toLowerCase()
    .trim();
  const currentUserEmail = (
    user?.email ||
    meProfile?.contactInformation?.emailAddress ||
    assessorProfile?.email ||
    ""
  )
    .toLowerCase()
    .trim();
  const userNames = [
    user?.fullName,
    (user as any)?.name,
    `${(user as any)?.firstName || ""} ${(user as any)?.lastName || ""}`.trim(),
    assessorProfile?.name,
    `${meProfile?.personalDetails?.firstName || ""} ${meProfile?.personalDetails?.lastName || ""}`.trim(),
  ]
    .filter(Boolean)
    .map((n) => (n as string).toLowerCase().trim());
  const namesKey = userNames.join("|");

  return useCallback(
    (m: any) => {
      if (!m) return false;
      const mAssessorId = (m.assessorId || m.userId || m.id || "").toString().toLowerCase().trim();
      const mEmail = (m.email || "").toLowerCase().trim();
      const mName = (m.name || "").toLowerCase().trim();

      if (
        currentUserId &&
        (mAssessorId === currentUserId ||
          (m.userId && m.userId.toString().toLowerCase().trim() === currentUserId))
      ) {
        return true;
      }
      if (currentAssessorId && mAssessorId === currentAssessorId) return true;
      if (currentUserEmail && mEmail && currentUserEmail === mEmail) return true;
      const names = namesKey ? namesKey.split("|") : [];
      if (mName && names.some((n) => n === mName || n.includes(mName) || mName.includes(n))) {
        return true;
      }
      return false;
    },
    [currentUserId, currentAssessorId, currentUserEmail, namesKey],
  );
}
