"use client";

import { Layout } from "@retire-strong/shared-ui";
import { Card } from "@retire-strong/shared-ui";
import { useAuthGuard } from "@/lib/auth/guards";

export default function PlanPage() {
  useAuthGuard(); // Redirect to login if not authenticated

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Your Plan</h1>
        <Card title="Weekly Overview" subtitle="Your exercise plan for this week">
          <p className="text-lg text-gray-700">
            Your weekly plan will appear here once generated.
          </p>
        </Card>
        <Card title="Upcoming Sessions" subtitle="What's next">
          <p className="text-lg text-gray-700">
            Session details will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

