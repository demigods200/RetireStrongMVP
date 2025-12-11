"use client";

import { Layout } from "@retire-strong/shared-ui";
import { Card } from "@retire-strong/shared-ui";
import { useAuthGuard } from "@/lib/auth/guards";

export default function LibraryPage() {
  useAuthGuard(); // Redirect to login if not authenticated

  return (
    <Layout>
      <div className="content-spacing">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Content Library</h1>
        </div>
        <Card title="Exercise Videos" subtitle="Expert-vetted content">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Exercise videos and guides will appear here.
          </p>
        </Card>
        <Card title="Articles & Guides" subtitle="Educational content">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            Articles and educational materials will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

