"use client";

import { Layout } from "@retire-strong/shared-ui";
import { Card } from "@retire-strong/shared-ui";
import { useAuthGuard } from "@/lib/auth/guards";

export default function ProgressPage() {
  useAuthGuard(); // Redirect to login if not authenticated

  return (
    <Layout>
      <div className="content-spacing">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Your Progress</h1>
        </div>
        <Card title="Vitality Index" subtitle="Your overall wellness score">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Progress charts and metrics will appear here.
          </p>
        </Card>
        <Card title="Activity Streak" subtitle="Keep it going!">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Streak information will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

