"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@retire-strong/shared-ui";
import { MotivationQuiz } from "@/features/motivation/components/MotivationQuiz";
import { isAuthenticated } from "@/lib/auth/guards";

export default function MotivationQuizPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    let storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      storedUserId = `test-user-${Date.now()}`;
      localStorage.setItem("userId", storedUserId);
    }
    setUserId(storedUserId);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-16 sm:py-20">
          <p className="text-xl sm:text-2xl text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <Layout>
      <div className="py-0">
        <MotivationQuiz userId={userId} />
      </div>
    </Layout>
  );
}

