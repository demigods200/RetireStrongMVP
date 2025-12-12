"use client";

import { useEffect, useMemo, useState } from "react";
import { Layout, Card, Button } from "@retire-strong/shared-ui";
import { useAuthGuard, isAuthenticated } from "@/lib/auth/guards";

type MovementInstance = {
  movementId: string;
  name: string;
  description: string;
  prescription: {
    type: "reps" | "time";
    sets: number;
    reps?: string;
    seconds?: number;
    holdSeconds?: number;
    restSeconds?: number;
  };
  cautions?: string[];
};

type MovementSession = {
  sessionId: string;
  planId: string;
  userId: string;
  dayIndex: number;
  focus: string;
  status: "pending" | "completed";
  scheduledDate: string;
  movements: MovementInstance[];
};

type MovementPlan = {
  planId: string;
  userId: string;
  createdAt: string;
  startDate: string;
  schedule: string[];
  sessions: MovementSession[];
  cautions: string[];
};

export default function PlanPage() {
  useAuthGuard(); // Redirect to login if not authenticated

  const [userId, setUserId] = useState<string | null>(null);
  const [plan, setPlan] = useState<MovementPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) return;
    const stored = localStorage.getItem("userId");
    setUserId(stored);
  }, []);

  const fetchPlan = async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/plans/current?userId=${uid}`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Failed to load plan");
      }
      setPlan(data.data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPlan(userId);
    }
  }, [userId]);

  const handleGenerate = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/plans/starter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Unable to build plan");
      }
      setPlan(data.data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to build plan");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (sessionId: string) => {
    if (!userId) return;
    setCompleting(sessionId);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          feedback: { difficulty: "just_right" },
        }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Unable to complete session");
      }
      await fetchPlan(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete session");
    } finally {
      setCompleting(null);
    }
  };

  const upcomingSessions = useMemo(() => {
    if (!plan) return [];
    return [...plan.sessions].sort((a, b) => a.dayIndex - b.dayIndex);
  }, [plan]);

  return (
    <Layout>
      <div className="content-spacing">
        <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">Your Plan</h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">3-day starter plan focused on safety and confidence</p>
          </div>
          <Button onClick={handleGenerate} disabled={loading || !userId} variant="primary" size="lg">
            {plan ? "Regenerate Plan" : "Generate Plan"}
          </Button>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border-2 border-red-200 bg-red-50 p-5 sm:p-6 text-red-800 shadow-soft">
            <p className="font-semibold text-lg sm:text-xl">{error}</p>
          </div>
        )}

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          <Card title="Weekly Overview" subtitle="Plan cadence">
            {loading && <p className="text-lg sm:text-xl text-gray-600">Loading plan...</p>}
            {!loading && !plan && (
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                No plan yet. Generate a 3-day starter plan to get moving safely.
              </p>
            )}
            {plan && (
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    <span className="font-medium text-gray-500">Start date:</span>{" "}
                    <span className="font-semibold text-gray-900">{new Date(plan.startDate).toLocaleDateString()}</span>
                  </p>
                </div>
                <div>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    <span className="font-medium text-gray-500">Sessions:</span>{" "}
                    <span className="font-semibold text-gray-900">{plan.sessions.length}</span>
                  </p>
                </div>
                {plan.cautions.length > 0 && (
                  <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4 sm:p-5">
                    <p className="font-semibold text-lg sm:text-xl text-amber-800 mb-3">⚠️ Cautions</p>
                    <ul className="list-disc list-inside text-base sm:text-lg text-amber-800 space-y-2 leading-relaxed">
                      {plan.cautions.map((caution, index) => (
                        <li key={`caution-${index}`}>{caution}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="lg:col-span-2" title="Upcoming Sessions" subtitle="Built from the movement library">
            {loading && <p className="text-lg sm:text-xl text-gray-600">Loading sessions...</p>}
            {!loading && upcomingSessions.length === 0 && (
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                Generate your plan to see your first three sessions.
              </p>
            )}
            <div className="space-y-5 sm:space-y-6">
              {upcomingSessions.map((session) => (
                <div key={session.sessionId} className="rounded-2xl border-2 border-gray-200 p-5 sm:p-6 shadow-soft bg-gray-50 hover:shadow-medium transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                      <p className="text-sm sm:text-base text-gray-500 mb-2 font-medium">
                        {new Date(session.scheduledDate).toLocaleDateString()}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{session.focus}</p>
                      <p className="text-base sm:text-lg text-gray-600">
                        <span className="font-medium">Status:</span>{" "}
                        <span className={`font-semibold ${session.status === "completed" ? "text-green-600" : "text-primary"}`}>
                          {session.status === "completed" ? "✅ Complete" : "⏳ Pending"}
                        </span>
                      </p>
                    </div>
                    {session.status === "pending" && (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handleComplete(session.sessionId)}
                        disabled={completing === session.sessionId}
                      >
                        {completing === session.sessionId ? "Completing..." : "Mark Complete"}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {session.movements.map((movement) => (
                      <div key={movement.movementId} className="rounded-xl bg-white border border-gray-200 p-4 sm:p-5 shadow-soft">
                        <p className="font-bold text-xl sm:text-2xl text-gray-900 mb-2">{movement.name}</p>
                        <p className="text-base sm:text-lg text-gray-600 mb-3 leading-relaxed">{movement.description}</p>
                        <div className="bg-primary/5 rounded-lg p-3 sm:p-4 border border-primary/20">
                          <p className="text-base sm:text-lg text-gray-900 font-semibold">
                            📋 {movement.prescription.sets} sets ×{" "}
                            {movement.prescription.type === "reps"
                              ? `${movement.prescription.reps ?? ""} reps`
                              : `${movement.prescription.seconds ?? movement.prescription.holdSeconds ?? ""} seconds`}
                          </p>
                        </div>
                        {movement.cautions && movement.cautions.length > 0 && (
                          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 sm:p-4">
                            <ul className="list-disc list-inside text-base sm:text-lg text-amber-800 space-y-1 leading-relaxed">
                              {movement.cautions.map((caution) => (
                                <li key={caution}>{caution}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

