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

    // Get userId from localStorage (set during login/signup)
    let storedUserId = localStorage.getItem("userId");
    
    // If not in localStorage, try to decode from JWT idToken
    if (!storedUserId) {
      const idToken = localStorage.getItem("idToken");
      if (idToken) {
        try {
          // Decode JWT token to get userId (sub claim)
          const parts = idToken.split(".");
          if (parts.length === 3) {
            const payload = parts[1];
            const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
            const decoded = JSON.parse(atob(paddedPayload));
            if (decoded.sub) {
              storedUserId = decoded.sub;
              localStorage.setItem("userId", storedUserId);
            }
          }
        } catch (error) {
          console.error("Failed to decode JWT token:", error);
        }
      }
    }

    if (!storedUserId) {
      // If still no userId, redirect to login
      router.push("/login");
      return;
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

