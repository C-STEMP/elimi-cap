import { Suspense } from "react";
import { CompleteSignUp } from "@/src/features/shared/authentication/pages/CompleteSignUp";
import { Loader } from "@/src/components/ui/loader";

export default function CompleteSignUpPage() {
  return (
    <Suspense fallback={<Loader fullscreen={false} size="small" className="min-h-50" />}>
      <CompleteSignUp />
    </Suspense>
  );
}
