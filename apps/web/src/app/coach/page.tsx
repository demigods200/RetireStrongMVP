"use client";

import { Layout } from "@retire-strong/shared-ui";
import { useAuthGuard } from "@/lib/auth/guards";
import { CoachChat } from "@/features/coach/components/CoachChat";
import { useEffect, useState } from "react";

export default function CoachPage() {
  useAuthGuard(); // Redirect to login if not authenticated

  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Get userId from localStorage (set during login)
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  return (
    <Layout>
      <div className="content-spacing">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">AI Coach</h1>
          <p className="text-lg text-gray-600 mt-2">
            Get personalized guidance, motivation, and answers to your questions
          </p>
        </div>
        
        {userId ? (
          <CoachChat userId={userId} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading coach...</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

