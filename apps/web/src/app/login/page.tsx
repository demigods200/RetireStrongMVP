"use client";

import { Suspense } from "react";
import { Layout } from "@retire-strong/shared-ui";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useGuestGuard } from "@/lib/auth/guards";

function LoginContent() {
  useGuestGuard(); // Redirect to /today if already logged in

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8 sm:py-12">
        <LoginForm />
      </div>
    </Layout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

