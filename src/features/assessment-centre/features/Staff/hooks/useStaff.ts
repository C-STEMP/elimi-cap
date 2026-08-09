import {
  useGetCentreStaff,
  useAddCentreStaff,
} from "@/src/features/shared/centre/hooks";

export function useGetStaff() {
  return useGetCentreStaff();
}

export function useAddStaff() {
  return useAddCentreStaff();
}

/**
 * Composite hook for Staff feature operations
 */
export function useStaff() {
  const getStaff = useGetStaff();
  const addStaff = useAddStaff();

  return {
    getStaff,
    addStaff,
  };
}
