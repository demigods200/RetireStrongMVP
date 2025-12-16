"use client";

import { useEffect, useState } from "react";
import { Layout, Card, Button } from "@retire-strong/shared-ui";
import { useAuthGuard } from "@/lib/auth/guards";
import Link from "next/link";

interface AdherenceSummary {
  periodStart: string;
  periodEnd: string;
  sessionsCompleted: number;
  sessionsPlanned: number;
  adherenceRate: number;
  averageDifficulty: number;
  trendingEasier: boolean;
  averagePainLevel: number;
  painIncreasing: boolean;
  frequentPainLocations: string[];
  averageEnergyBefore: number;
  averageEnergyAfter: number;
  recentSkipStreak: number;
  motivationTrend: "increasing" | "stable" | "decreasing";
}

interface DropoffRisk {
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  factors: string[];
  recommendations: string[];
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [adherenceSummary, setAdherenceSummary] = useState<AdherenceSummary | null>(null);
  const [dropoffRisk, setDropoffRisk] = useState<DropoffRisk | null>(null);

  useAuthGuard(); // Redirect to login if not authenticated

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    const fetchData = async () => {
      try {
        if (!storedUserId) {
          setLoading(false);
          return;
        }

        const adherenceRes = await fetch(`/api/checkins/adherence-summary?userId=${storedUserId}&days=30`);
        if (adherenceRes.ok) {
          const adherenceData = await adherenceRes.json();
          setAdherenceSummary(adherenceData.summary);
          setDropoffRisk(adherenceData.dropoffRisk);
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="content-spacing">
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">Loading your progress...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const painLevelLabels = ["None", "Mild", "Moderate", "Severe"];
  const difficultyLabels = ["Too Easy", "", "Just Right", "", "Too Hard"];
  const energyLabels = ["Very Low", "Low", "Moderate", "High", "Very High"];

  // Calculate vitality score (0-100)
  const calculateVitalityScore = () => {
    if (!adherenceSummary) return 0;

    let score = 0;

    // Adherence (40 points)
    score += adherenceSummary.adherenceRate * 40;

    // Pain management (30 points) - lower pain = higher score
    score += (1 - adherenceSummary.averagePainLevel / 3) * 30;

    // Energy trend (15 points)
    const energyImprovement = adherenceSummary.averageEnergyAfter - adherenceSummary.averageEnergyBefore;
    score += Math.max(0, Math.min(15, (energyImprovement + 2) * 7.5));

    // Consistency (15 points) - no skip streaks
    score += adherenceSummary.recentSkipStreak === 0 ? 15 : Math.max(0, 15 - adherenceSummary.recentSkipStreak * 5);

    return Math.round(Math.min(100, Math.max(0, score)));
  };

  const vitalityScore = calculateVitalityScore();

  const getVitalityLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (score >= 60) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    if (score >= 40) return { label: "Fair", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
    return { label: "Needs Attention", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
  };

  const vitalityLevel = getVitalityLevel(vitalityScore);

  return (
    <Layout>
      <div className="content-spacing">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Your Progress</h1>
          <p className="text-xl text-gray-600 mt-2">Last 30 days</p>
        </div>

        {/* Vitality Score Card */}
        <Card
          title="Vitality Index"
          subtitle="Your overall wellness score"
          className={`mb-6 border-2 ${vitalityLevel.border} ${vitalityLevel.bg}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className={`text-6xl font-bold ${vitalityLevel.color} mb-2`}>
                {vitalityScore}
              </div>
              <div className={`text-2xl font-semibold ${vitalityLevel.color}`}>
                {vitalityLevel.label}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Based on:</div>
              <div className="text-sm text-gray-700">
                • Adherence<br />
                • Pain levels<br />
                • Energy trends<br />
                • Consistency
              </div>
            </div>
          </div>

          {adherenceSummary && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary">{Math.round(adherenceSummary.adherenceRate * 100)}%</div>
                  <div className="text-sm text-gray-600">Adherence</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {painLevelLabels[Math.round(adherenceSummary.averagePainLevel)]}
                  </div>
                  <div className="text-sm text-gray-600">Avg Pain</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {adherenceSummary.sessionsCompleted}
                  </div>
                  <div className="text-sm text-gray-600">Sessions Done</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {adherenceSummary.recentSkipStreak === 0 ? "✓" : adherenceSummary.recentSkipStreak}
                  </div>
                  <div className="text-sm text-gray-600">Skip Streak</div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Adherence Tracking */}
        {adherenceSummary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Adherence Rate Card */}
              <Card title="Adherence Rate" subtitle="Session completion">
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-4xl font-bold text-primary">
                      {Math.round(adherenceSummary.adherenceRate * 100)}%
                    </span>
                    <span className="text-lg text-gray-600">
                      {adherenceSummary.sessionsCompleted}/{adherenceSummary.sessionsPlanned} sessions
                    </span>
                  </div>

                  {/* Visual bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${adherenceSummary.adherenceRate * 100}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-2xl ${adherenceSummary.motivationTrend === "increasing" ? "text-green-500" : adherenceSummary.motivationTrend === "decreasing" ? "text-orange-500" : "text-gray-500"}`}>
                      {adherenceSummary.motivationTrend === "increasing" ? "↗" : adherenceSummary.motivationTrend === "decreasing" ? "↘" : "→"}
                    </span>
                    <span>Motivation trend: <strong>{adherenceSummary.motivationTrend}</strong></span>
                  </div>
                  {adherenceSummary.recentSkipStreak > 0 && (
                    <p className="text-orange-600">⚠ Current skip streak: {adherenceSummary.recentSkipStreak} sessions</p>
                  )}
                </div>
              </Card>

              {/* Difficulty Tracking Card */}
              <Card title="Difficulty Level" subtitle="How challenging sessions feel">
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-4xl font-bold text-primary">
                      {difficultyLabels[Math.round(adherenceSummary.averageDifficulty - 1)]}
                    </span>
                    <span className="text-lg text-gray-600">
                      {adherenceSummary.averageDifficulty.toFixed(1)}/5
                    </span>
                  </div>

                  {/* Visual difficulty scale */}
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 h-8 rounded ${level <= Math.round(adherenceSummary.averageDifficulty)
                          ? "bg-primary"
                          : "bg-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-700">
                  {adherenceSummary.trendingEasier ? (
                    <p className="text-green-600">✓ Sessions are getting easier! Great progress.</p>
                  ) : (
                    <p>Difficulty level is stable.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Pain & Energy Tracking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Pain Tracking Card */}
              <Card title="Pain Management" subtitle="Comfort during sessions">
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-4xl font-bold text-primary">
                      {painLevelLabels[Math.round(adherenceSummary.averagePainLevel)]}
                    </span>
                    <span className="text-lg text-gray-600">
                      {adherenceSummary.averagePainLevel.toFixed(1)}/3
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-700 space-y-2">
                  {adherenceSummary.painIncreasing ? (
                    <p className="text-orange-600">⚠ Pain levels are increasing. Consider consulting your healthcare provider.</p>
                  ) : (
                    <p className="text-green-600">✓ Pain levels are stable or improving.</p>
                  )}

                  {adherenceSummary.frequentPainLocations.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Frequent discomfort areas:</p>
                      <div className="flex flex-wrap gap-2">
                        {adherenceSummary.frequentPainLocations.map((location) => (
                          <span key={location} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                            {location.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Energy Tracking Card */}
              <Card title="Energy Levels" subtitle="Before and after sessions">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">Before sessions:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {energyLabels[Math.round(adherenceSummary.averageEnergyBefore) - 1]}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(adherenceSummary.averageEnergyBefore / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">After sessions:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {energyLabels[Math.round(adherenceSummary.averageEnergyAfter) - 1]}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-green-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(adherenceSummary.averageEnergyAfter / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {adherenceSummary.averageEnergyAfter > adherenceSummary.averageEnergyBefore ? (
                    <p className="text-sm text-green-600 mt-4">
                      ✓ Sessions consistently boost your energy! (+{(adherenceSummary.averageEnergyAfter - adherenceSummary.averageEnergyBefore).toFixed(1)} average)
                    </p>
                  ) : adherenceSummary.averageEnergyAfter < adherenceSummary.averageEnergyBefore ? (
                    <p className="text-sm text-orange-600 mt-4">
                      Sessions may be too intense. Consider adjusting difficulty.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mt-4">
                      Energy levels remain stable during sessions.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Drop-off Risk Assessment */}
            {dropoffRisk && (
              <Card
                title="Engagement Health"
                subtitle="How we can support you"
                className={`border-2 ${dropoffRisk.riskLevel === "high" ? "border-orange-200 bg-orange-50" :
                  dropoffRisk.riskLevel === "medium" ? "border-yellow-200 bg-yellow-50" :
                    "border-green-200 bg-green-50"
                  }`}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-3xl font-bold ${dropoffRisk.riskLevel === "high" ? "text-orange-600" :
                      dropoffRisk.riskLevel === "medium" ? "text-yellow-600" :
                        "text-green-600"
                      }`}>
                      {dropoffRisk.riskLevel === "high" ? "⚠" : dropoffRisk.riskLevel === "medium" ? "⚡" : "✓"}
                    </span>
                    <div>
                      <div className="text-2xl font-semibold capitalize">{dropoffRisk.riskLevel} Risk</div>
                      <div className="text-sm text-gray-600">Risk score: {Math.round(dropoffRisk.riskScore * 100)}%</div>
                    </div>
                  </div>

                  {dropoffRisk.factors.length > 0 && (
                    <div className="mb-4">
                      <p className="font-medium text-gray-900 mb-2">Factors to consider:</p>
                      <ul className="space-y-1">
                        {dropoffRisk.factors.map((factor, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span>•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dropoffRisk.recommendations.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Our recommendations:</p>
                      <ul className="space-y-1">
                        {dropoffRisk.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span>→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Link href="/coach">
                  <Button variant="outline" className="w-full">
                    💬 Talk to Your Coach
                  </Button>
                </Link>
              </Card>
            )}
          </>
        )}

        {!adherenceSummary && (
          <Card title="Start Tracking" subtitle="Complete sessions to see your progress">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              As you complete sessions and check-ins, your progress will be tracked here.
              You'll see trends in adherence, difficulty, pain management, and energy levels.
            </p>
            <Link href="/plan">
              <Button size="lg" className="w-full">View Your Plan</Button>
            </Link>
          </Card>
        )}
      </div>
    </Layout>
  );
}

