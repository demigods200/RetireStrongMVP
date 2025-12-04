"use client";

import { Layout } from "@retire-strong/shared-ui";
import { Card, Button } from "@retire-strong/shared-ui";
import Link from "next/link";
import { useAuthGuard } from "@/lib/auth/guards";

export default function SettingsPage() {
  useAuthGuard(); // Redirect to login if not authenticated
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <Card title="Account" subtitle="Manage your account">
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              View and manage your account information.
            </p>
            <Link href="/account">
              <Button variant="outline">View Account</Button>
            </Link>
          </div>
        </Card>
        <Card title="Preferences" subtitle="Customize your experience">
          <p className="text-lg text-gray-700">
            User preferences will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

