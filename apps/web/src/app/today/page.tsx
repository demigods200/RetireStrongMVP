"use client";

import { useEffect, useState } from "react";
import { Layout } from "@retire-strong/shared-ui";
import { Card } from "@retire-strong/shared-ui";
import { useAuthGuard } from "@/lib/auth/guards";

export default function TodayPage() {
  const [showWelcome, setShowWelcome] = useState(false);

  useAuthGuard(); // Redirect to login if not authenticated

  useEffect(() => {
    // Check URL params on client side
    const params = new URLSearchParams(window.location.search);
    if (params.get("onboarding") === "complete") {
      setShowWelcome(true);
    }

  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {showWelcome && (
          <Card title="Welcome!" subtitle="Your profile is complete">
            <p className="text-lg text-gray-700 mb-4">
              Great! We've set up your personalized wellness plan. Let's get started with your first session.
            </p>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-primary hover:text-primary-dark font-semibold"
            >
              Dismiss
            </button>
          </Card>
        )}
        <h1 className="text-4xl font-bold text-gray-900">Today</h1>
        <Card title="Your Daily Session" subtitle="Ready to get started?">
          <p className="text-lg text-gray-700">
            Your personalized session plan will appear here once you complete onboarding.
          </p>
        </Card>
        <Card title="Daily Check-in" subtitle="How are you feeling today?">
          <p className="text-lg text-gray-700">
            Check-in form will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

