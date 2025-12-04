"use client";

import { Layout } from "@retire-strong/shared-ui";
import { Card } from "@retire-strong/shared-ui";
import { useAuthGuard } from "@/lib/auth/guards";

export default function ProgressPage() {
  useAuthGuard(); // Redirect to login if not authenticated

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Your Progress</h1>
        <Card title="Vitality Index" subtitle="Your overall wellness score">
          <p className="text-lg text-gray-700">
            Progress charts and metrics will appear here.
          </p>
        </Card>
        <Card title="Activity Streak" subtitle="Keep it going!">
          <p className="text-lg text-gray-700">
            Streak information will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

