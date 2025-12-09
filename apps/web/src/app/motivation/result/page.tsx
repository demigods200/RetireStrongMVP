"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout, Button } from "@retire-strong/shared-ui";
import { isAuthenticated } from "@/lib/auth/guards";

interface CoachPersona {
  name: string;
  description: string;
  tone: {
    formality: string;
    encouragement: string;
    directness: string;
    humor: string;
  };
  avatar?: string;
}

interface QuizResult {
  profile: {
    primaryMotivator: string;
    secondaryMotivators: string[];
    scores: Record<string, number>;
  };
  persona: CoachPersona;
}

export default function MotivationResultPage() {
  const router = useRouter();
  const [persona, setPersona] = useState<CoachPersona | null>(null);
  const [fullResult, setFullResult] = useState<QuizResult | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Get full result from localStorage
    const storedResult = localStorage.getItem("quizResult");
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setFullResult(parsed);
        setPersona(parsed.persona);
      } catch (error) {
        console.error("Failed to parse quiz result:", error);
      }
    } else {
      // Fallback to just persona
      const storedPersona = localStorage.getItem("coachPersona");
      if (storedPersona) {
        try {
          setPersona(JSON.parse(storedPersona));
        } catch (error) {
          console.error("Failed to parse persona:", error);
        }
      }
    }
    setLoading(false);
  }, [router]);

  const handleContinue = () => {
    router.push("/today");
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!persona) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No persona data found</p>
          <Button onClick={() => router.push("/motivation/quiz")} className="mt-4">
            Take Quiz
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Meet Your Coach</h1>
            <p className="text-lg text-gray-600">We've matched you with a coach that fits your style</p>
          </div>

          {/* Persona Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-8 py-10 text-center">
              {/* Avatar Placeholder */}
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-bold text-primary">
                  {persona.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>

              {/* Persona Name */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{persona.name}</h2>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                {persona.description}
              </p>

              {/* Tone Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Coaching Style</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Formality:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">{persona.tone.formality}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Encouragement:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">{persona.tone.encouragement}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Directness:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">{persona.tone.directness}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Humor:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">{persona.tone.humor}</span>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <Button onClick={handleContinue} size="lg" className="min-w-[200px]">
                Continue to My Plan
              </Button>
            </div>
          </div>

          {/* Profile Details */}
          {fullResult?.profile && (
            <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-8 py-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Motivation Profile</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500">Primary Motivator:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">
                      {fullResult.profile.primaryMotivator.replace("_", " ")}
                    </span>
                  </div>
                  {fullResult.profile.secondaryMotivators.length > 0 && (
                    <div>
                      <span className="text-gray-500">Secondary Motivators:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {fullResult.profile.secondaryMotivators
                          .map((m) => m.replace("_", " "))
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Raw API Response (Collapsible) */}
          <div className="mt-6">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="font-medium text-gray-700">
                {showRawData ? "▼" : "▶"} View Raw API Response
              </span>
            </button>
            {showRawData && (
              <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-auto">
                <pre className="text-xs text-green-400 font-mono">
                  {JSON.stringify(fullResult || { persona }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

