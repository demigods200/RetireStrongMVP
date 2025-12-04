"use client";

import { Layout } from "@retire-strong/shared-ui";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { useGuestGuard } from "@/lib/auth/guards";

export default function SignupPage() {
  useGuestGuard(); // Redirect to /today if already logged in

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <SignupForm />
      </div>
    </Layout>
  );
}

