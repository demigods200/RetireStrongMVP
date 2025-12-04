"use client";

import { Layout } from "@retire-strong/shared-ui";
import { Card } from "@retire-strong/shared-ui";
import { useAuthGuard } from "@/lib/auth/guards";

export default function CoachPage() {
  useAuthGuard(); // Redirect to login if not authenticated

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">AI Coach</h1>
        <Card title="Chat with Your Coach" subtitle="Ask questions, get guidance">
          <p className="text-lg text-gray-700">
            Coach chat interface will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

