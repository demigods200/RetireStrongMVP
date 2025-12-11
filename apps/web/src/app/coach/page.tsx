"use client";

import { Layout } from "@retire-strong/shared-ui";
import { Card } from "@retire-strong/shared-ui";
import { useAuthGuard } from "@/lib/auth/guards";

export default function CoachPage() {
  useAuthGuard(); // Redirect to login if not authenticated

  return (
    <Layout>
      <div className="content-spacing">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">AI Coach</h1>
        </div>
        <Card title="Chat with Your Coach" subtitle="Ask questions, get guidance">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Coach chat interface will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

