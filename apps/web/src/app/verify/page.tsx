"use client";

import { Suspense } from "react";
import { Layout } from "@retire-strong/shared-ui";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";
import { useGuestGuard } from "@/lib/auth/guards";

function VerifyContent() {
  useGuestGuard(); // Redirect to /today if already logged in

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <VerifyEmailForm />
      </div>
    </Layout>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}

