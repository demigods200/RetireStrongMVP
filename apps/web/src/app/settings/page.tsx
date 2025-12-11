"use client";

import { Layout } from "@retire-strong/shared-ui";
import { Card, Button } from "@retire-strong/shared-ui";
import Link from "next/link";
import { useAuthGuard } from "@/lib/auth/guards";

export default function SettingsPage() {
  useAuthGuard(); // Redirect to login if not authenticated
  return (
    <Layout>
      <div className="content-spacing">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Settings</h1>
        </div>
        <Card title="Account" subtitle="Manage your account">
          <div className="space-y-6">
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
              View and manage your account information.
            </p>
            <Link href="/account">
              <Button variant="outline">View Account</Button>
            </Link>
          </div>
        </Card>
        <Card title="Preferences" subtitle="Customize your experience">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
            User preferences will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

