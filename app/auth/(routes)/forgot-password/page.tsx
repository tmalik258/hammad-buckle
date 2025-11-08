import { Suspense } from "react";
import ForgotPasswordPage from "./_components/forgot-password-page";
import { LumaSpin } from "@/components/luma-spin";

const ForgotPasswordPageWrapper = () => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center h-full">
        <LumaSpin />
      </div>
    }
  >
    <ForgotPasswordPage />
  </Suspense>
);

export default ForgotPasswordPageWrapper;