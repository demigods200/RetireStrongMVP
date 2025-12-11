"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout, Button, Card } from "@retire-strong/shared-ui";
import { isAuthenticated } from "@/lib/auth/guards";

interface OnboardingResult {
  userId: string;
  onboardingComplete: boolean;
  onboardingData?: {
    demographics?: {
      age?: number;
      gender?: string;
      location?: string;
    };
    healthContext?: {
      activityLevel?: string;
      healthConditions?: string[];
      mobilityLimitations?: string[];
      equipmentAvailable?: string[];
    };
    goals?: string[];
    schedulePreferences?: {
      preferredDays?: string[];
      preferredTime?: string;
      sessionDuration?: number;
    };
  };
}

export default function OnboardingResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<OnboardingResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Get result from localStorage (stored after onboarding completion)
    const storedResult = localStorage.getItem("onboardingResult");
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setResult(parsed);
      } catch (error) {
        console.error("Failed to parse onboarding result:", error);
      }
    }
    setLoading(false);
  }, [router]);

  const handleContinue = () => {
    router.push("/motivation/quiz");
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-16 sm:py-20">
          <p className="text-xl sm:text-2xl text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!result) {
    return (
      <Layout>
        <div className="text-center py-16 sm:py-20">
          <p className="text-xl sm:text-2xl text-gray-600 mb-6">No onboarding data found</p>
          <Button onClick={() => router.push("/onboarding")}>
            Complete Onboarding
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="text-6xl sm:text-7xl mb-6">✅</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">Onboarding Complete!</h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">Your profile has been saved successfully</p>
          </div>

          {/* Success Card */}
          <Card title="Profile Summary" subtitle="Here's what we've saved">
            <div className="space-y-8 sm:space-y-10">
              {/* Demographics */}
              {result.onboardingData?.demographics && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5">About You</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-base sm:text-lg">
                    {result.onboardingData.demographics.age && (
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {result.onboardingData.demographics.age}
                        </span>
                      </div>
                    )}
                    {result.onboardingData.demographics.gender && (
                      <div>
                        <span className="text-gray-500">Gender:</span>
                        <span className="ml-2 font-medium text-gray-900 capitalize">
                          {result.onboardingData.demographics.gender.replace("_", " ")}
                        </span>
                      </div>
                    )}
                    {result.onboardingData.demographics.location && (
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {result.onboardingData.demographics.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Health Context */}
              {result.onboardingData?.healthContext && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5">Health & Activity</h3>
                  <div className="space-y-3 text-base sm:text-lg">
                    {result.onboardingData.healthContext.activityLevel && (
                      <div>
                        <span className="text-gray-500">Activity Level:</span>
                        <span className="ml-2 font-medium text-gray-900 capitalize">
                          {result.onboardingData.healthContext.activityLevel}
                        </span>
                      </div>
                    )}
                    {result.onboardingData.healthContext.healthConditions &&
                      result.onboardingData.healthContext.healthConditions.length > 0 && (
                        <div>
                          <span className="text-gray-500">Health Conditions:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {result.onboardingData.healthContext.healthConditions.join(", ")}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Goals */}
              {result.onboardingData?.goals && result.onboardingData.goals.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5">Your Goals</h3>
                  <div className="flex flex-wrap gap-3">
                    {result.onboardingData.goals.map((goal, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-base sm:text-lg font-semibold"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule */}
              {result.onboardingData?.schedulePreferences && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5">Schedule Preferences</h3>
                  <div className="space-y-3 text-base sm:text-lg">
                    {result.onboardingData.schedulePreferences.preferredDays &&
                      result.onboardingData.schedulePreferences.preferredDays.length > 0 && (
                        <div>
                          <span className="text-gray-500">Preferred Days:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {result.onboardingData.schedulePreferences.preferredDays
                              .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    {result.onboardingData.schedulePreferences.preferredTime && (
                      <div>
                        <span className="text-gray-500">Preferred Time:</span>
                        <span className="ml-2 font-medium text-gray-900 capitalize">
                          {result.onboardingData.schedulePreferences.preferredTime}
                        </span>
                      </div>
                    )}
                    {result.onboardingData.schedulePreferences.sessionDuration && (
                      <div>
                        <span className="text-gray-500">Session Duration:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {result.onboardingData.schedulePreferences.sessionDuration} minutes
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {result.onboardingComplete ? "✅ Complete" : "⏳ In Progress"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">User ID:</span>
                    <span className="ml-2 font-mono text-xs text-gray-600">{result.userId}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Continue Button */}
          <div className="mt-10 sm:mt-12 text-center">
            <Button onClick={handleContinue} size="lg" className="min-w-[240px]">
              Continue to Motivation Quiz
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

