"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@retire-strong/shared-ui";
import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard";
import { isAuthenticated } from "@/lib/auth/guards";

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Get userId from token or localStorage (simplified - in production, decode JWT)
    // For testing: if no userId, create a test one
    let storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      // Create a test userId for testing purposes
      storedUserId = `test-user-${Date.now()}`;
      localStorage.setItem("userId", storedUserId);
    }
    setUserId(storedUserId);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <Layout>
      <div className="py-8">
        <OnboardingWizard userId={userId} />
      </div>
    </Layout>
  );
}

