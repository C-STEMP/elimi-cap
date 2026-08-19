import { Suspense } from "react";
import { VerifyEmail } from "@/src/features/shared/authentication/pages/VerifyEmail";
import { Loader } from "@/src/components/ui/loader";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loader fullscreen={false} size="small" className="min-h-50" />}>
      <VerifyEmail />
    </Suspense>
  );
}
