import { Suspense } from "react";
import { VerifyEmail } from "@/src/features/shared/authentication/pages/VerifyEmail";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-solid" />
        </div>
      }
    >
      <VerifyEmail />
    </Suspense>
  );
}
