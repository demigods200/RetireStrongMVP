"use client";

import { Layout } from "@retire-strong/shared-ui";
import { Card } from "@retire-strong/shared-ui";
import { useAuthGuard } from "@/lib/auth/guards";

export default function LibraryPage() {
  useAuthGuard(); // Redirect to login if not authenticated

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Content Library</h1>
        <Card title="Exercise Videos" subtitle="Expert-vetted content">
          <p className="text-lg text-gray-700">
            Exercise videos and guides will appear here.
          </p>
        </Card>
        <Card title="Articles & Guides" subtitle="Educational content">
          <p className="text-lg text-gray-700">
            Articles and educational materials will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

