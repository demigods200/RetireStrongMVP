"use client";

import { Layout } from "@retire-strong/shared-ui";
import { Card, Button } from "@retire-strong/shared-ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/lib/auth/guards";

interface CoachPersona {
  name?: string;
  description?: string;
  tone?: string;
  avatar?: string;
}

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  coachPersona?: CoachPersona;
  onboardingComplete?: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAuthGuard(); // Redirect to login if not authenticated

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile from API
        const response = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        let data: any;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Failed to parse response:", parseError);
          setError(`Server error: ${response.status} ${response.statusText}`);
          return;
        }

        if (data.success && data.data) {
          setUser(data.data);
        } else {
          // Show more detailed error message
          const errorMsg = data.error?.message || data.error?.code || "Failed to load user profile";
          setError(errorMsg);
          console.error("API error:", data.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred while loading your profile";
        setError(errorMessage);
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("userId");
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

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-base">
            {error}
          </div>
        )}

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
              {user?.coachPersona?.name ? (
                <div>
                  <p className="text-lg text-gray-900 font-semibold">{user.coachPersona.name}</p>
                  {user.coachPersona.description && (
                    <p className="text-base text-gray-600 mt-1">{user.coachPersona.description}</p>
                  )}
                </div>
              ) : (
                <p className="text-lg text-gray-600 italic">Will be assigned after motivation quiz</p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Account Actions">
          <div className="space-y-4">
            {!user?.onboardingComplete && (
              <Link href="/onboarding">
                <Button variant="outline" className="w-full">
                  Complete Onboarding
                </Button>
              </Link>
            )}
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

