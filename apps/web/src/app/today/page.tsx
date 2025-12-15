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

interface Plan {
  planId: string;
  sessions: Array<{
    sessionId: string;
    dayIndex: number;
    focus: string;
    status: "pending" | "completed";
    scheduledDate: string;
    movements: Array<{
      movementId: string;
      name: string;
      description: string;
    }>;
  }>;
}

export default function TodayPage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [adherenceSummary, setAdherenceSummary] = useState<AdherenceSummary | null>(null);
  const [dropoffRisk, setDropoffRisk] = useState<DropoffRisk | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useAuthGuard(); // Redirect to login if not authenticated

  useEffect(() => {
    // Check URL params on client side
    const params = new URLSearchParams(window.location.search);
    if (params.get("onboarding") === "complete") {
      setShowWelcome(true);
    }

    // Get userId from localStorage
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);

    // Fetch user's plan and adherence data
    const fetchData = async () => {
      try {
        if (!storedUserId) {
          setLoading(false);
          return;
        }

        // Fetch current plan
        const planRes = await fetch(`/api/plans/current?userId=${storedUserId}`);
        if (planRes.ok) {
          const planData = await planRes.json();
          setPlan(planData.data);
        }

        // Fetch adherence summary
        const adherenceRes = await fetch(`/api/checkins/adherence-summary?userId=${storedUserId}&days=30`);
        if (adherenceRes.ok) {
          const adherenceData = await adherenceRes.json();
          setAdherenceSummary(adherenceData.summary);
          setDropoffRisk(adherenceData.dropoffRisk);
        }
      } catch (error) {
        console.error("Error fetching today's data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get today's session
  const todaySession = plan?.sessions.find(s => s.status === "pending");

  // Generate personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Generate motivational message based on adherence
  const getMotivationalMessage = () => {
    if (!adherenceSummary) return "You're doing great! Keep up the momentum.";

    if (adherenceSummary.adherenceRate >= 0.8) {
      return "🌟 You're on fire! Your consistency is impressive.";
    } else if (adherenceSummary.adherenceRate >= 0.6) {
      return "💪 You're building great habits! Keep it going.";
    } else if (adherenceSummary.recentSkipStreak >= 3) {
      return "We noticed you've been away. No worries—today is a perfect day for a fresh start!";
    } else if (adherenceSummary.adherenceRate < 0.5) {
      return "Every small step counts. Let's make today count!";
    }
    return "You're making progress! Stay consistent and you'll see results.";
  };

  // Get insight based on trends
  const getPersonalizedInsight = () => {
    if (!adherenceSummary) return null;

    if (adherenceSummary.painIncreasing) {
      return {
        type: "warning",
        title: "Pain Management",
        message: "We've noticed increasing pain levels. Today's session has been adjusted for comfort. Consider consulting your healthcare provider if pain persists."
      };
    }

    if (adherenceSummary.trendingEasier && adherenceSummary.adherenceRate > 0.7) {
      return {
        type: "success",
        title: "Ready to Progress",
        message: "You're getting stronger! We've added some gentle progressions to keep you challenged."
      };
    }

    if (dropoffRisk?.riskLevel === "high") {
      return {
        type: "info",
        title: "Let's Adjust",
        message: dropoffRisk.recommendations[0] || "We've simplified today's session to help you get back on track."
      };
    }

    if (adherenceSummary.averageEnergyAfter > adherenceSummary.averageEnergyBefore) {
      return {
        type: "success",
        title: "Energy Boost",
        message: "Your sessions consistently increase your energy. That's the power of movement!"
      };
    }

    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="content-spacing">
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">Loading your personalized plan...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const insight = getPersonalizedInsight();

  return (
    <Layout>
      <div className="content-spacing">
        {showWelcome && (
          <Card title="Welcome!" subtitle="Your profile is complete" className="border-2 border-primary/20 bg-primary/5 mb-6">
            <p className="text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed">
              Great! We've set up your personalized wellness plan. Let's get started with your first session.
            </p>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-primary hover:text-primary-dark font-semibold text-lg transition-colors duration-200"
            >
              Dismiss
            </button>
          </Card>
        )}

        {/* Personalized Greeting */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            {getGreeting()}!
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Personalized Insight Card */}
        {insight && (
          <Card 
            title={insight.title} 
            className={`mb-6 border-2 ${
              insight.type === "warning" ? "border-orange-200 bg-orange-50" :
              insight.type === "success" ? "border-green-200 bg-green-50" :
              "border-blue-200 bg-blue-50"
            }`}
          >
            <p className="text-lg text-gray-700 leading-relaxed">{insight.message}</p>
          </Card>
        )}

        {/* Quick Stats */}
        {adherenceSummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:shadow-soft transition-all duration-200">
              <div className="text-3xl font-bold text-primary mb-1">
                {Math.round(adherenceSummary.adherenceRate * 100)}%
              </div>
              <div className="text-sm text-gray-600">Adherence Rate</div>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:shadow-soft transition-all duration-200">
              <div className="text-3xl font-bold text-primary mb-1">
                {adherenceSummary.sessionsCompleted}
              </div>
              <div className="text-sm text-gray-600">Sessions Completed</div>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:shadow-soft transition-all duration-200">
              <div className="text-3xl font-bold text-primary mb-1">
                {adherenceSummary.recentSkipStreak === 0 ? "✓" : adherenceSummary.recentSkipStreak}
              </div>
              <div className="text-sm text-gray-600">
                {adherenceSummary.recentSkipStreak === 0 ? "No Skips" : "Skip Streak"}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:shadow-soft transition-all duration-200">
              <div className="text-3xl font-bold text-primary mb-1">
                {adherenceSummary.motivationTrend === "increasing" ? "↗" :
                 adherenceSummary.motivationTrend === "decreasing" ? "↘" : "→"}
              </div>
              <div className="text-sm text-gray-600">Motivation Trend</div>
            </div>
          </div>
        )}

        {/* Today's Session */}
        {todaySession ? (
          <Card title="Today's Session" subtitle={todaySession.focus}>
            <div className="mb-6">
              <p className="text-lg text-gray-700 mb-4">
                {todaySession.movements.length} exercises • Estimated 15-20 minutes
              </p>
              <div className="space-y-2 mb-6">
                {todaySession.movements.slice(0, 3).map((movement, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-semibold">{idx + 1}.</span>
                    <span className="text-gray-700">{movement.name}</span>
                  </div>
                ))}
                {todaySession.movements.length > 3 && (
                  <p className="text-gray-600 text-sm ml-5">
                    + {todaySession.movements.length - 3} more exercises
                  </p>
                )}
              </div>
            </div>
            <Link href={`/plan`}>
              <Button size="lg" className="w-full">Start Session</Button>
            </Link>
          </Card>
        ) : (
          <Card title="Your Session Plan" subtitle="Get started today">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {plan ? "Great job! You've completed all pending sessions. Check your plan for updates." : 
               "Complete your onboarding to get your personalized session plan."}
            </p>
            <Link href={plan ? "/plan" : "/onboarding"}>
              <Button size="lg" className="w-full">
                {plan ? "View Plan" : "Complete Onboarding"}
              </Button>
            </Link>
          </Card>
        )}

        {/* Quick Actions */}
        <Card title="Quick Actions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/coach" 
              className="block p-5 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-soft transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900">💬 Chat with Coach</h3>
              <p className="text-base text-gray-600 leading-relaxed">Get guidance and motivation</p>
            </Link>
            <Link 
              href="/progress" 
              className="block p-5 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-soft transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900">📊 View Progress</h3>
              <p className="text-base text-gray-600 leading-relaxed">Track your improvements</p>
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

