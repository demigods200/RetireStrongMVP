"use client";

import { Layout } from "@retire-strong/shared-ui";
import { Card, Button } from "@retire-strong/shared-ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/lib/auth/guards";

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useAuthGuard(); // Redirect to login if not authenticated

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    // Fetch user profile (simplified - will be implemented with real API)
    // For now, just show placeholder
    setUser({
      userId: "user-123",
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
    });
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Account</h1>

        <Card title="Profile Information" subtitle="Your account details">
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">Email</label>
              <p className="text-lg text-gray-900">{user?.email || "Not available"}</p>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">Name</label>
              <p className="text-lg text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">Coach Persona</label>
              <p className="text-lg text-gray-600 italic">Will be assigned after motivation quiz</p>
            </div>
          </div>
        </Card>

        <Card title="Account Actions">
          <div className="space-y-4">
            <Link href="/onboarding">
              <Button variant="outline" className="w-full">
                Complete Onboarding
              </Button>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors min-h-[44px]"
            >
              Sign Out
            </button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

