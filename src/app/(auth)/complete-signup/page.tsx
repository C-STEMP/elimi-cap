import { Suspense } from "react";
import { CompleteSignUp } from "@/src/features/shared/authentication/pages/CompleteSignUp";

export default function CompleteSignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-solid" />
        </div>
      }
    >
      <CompleteSignUp />
    </Suspense>
  );
}
