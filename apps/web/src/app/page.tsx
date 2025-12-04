"use client";

import { useState, useEffect } from "react";
import { Layout } from "@retire-strong/shared-ui";
import { Button, Card } from "@retire-strong/shared-ui";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth/guards";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status on client side
    setAuthenticated(isAuthenticated());
    setLoading(false);
  }, []);

  // Show loading state briefly to avoid flash
  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  // Authenticated users see dashboard/welcome view
  if (authenticated) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <h1 className="text-5xl font-bold text-primary mb-4">
              Welcome Back!
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Ready to continue your wellness journey?
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/today">
                <Button size="lg">Go to Today's Session</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            <div className="flex">
              <Card title="Today" subtitle="Your daily session" className="w-full">
                <p className="text-lg text-gray-700 mb-6">
                  Complete your exercises and check-in for today.
                </p>
                <div className="mt-auto">
                  <Link href="/today">
                    <Button className="w-full">Start Session</Button>
                  </Link>
                </div>
              </Card>
            </div>

            <div className="flex">
              <Card title="Your Plan" subtitle="Weekly overview" className="w-full">
                <p className="text-lg text-gray-700 mb-6">
                  See your exercise plan for this week.
                </p>
                <div className="mt-auto">
                  <Link href="/plan">
                    <Button className="w-full" variant="outline">View Plan</Button>
                  </Link>
                </div>
              </Card>
            </div>

            <div className="flex">
              <Card title="Progress" subtitle="Track your journey" className="w-full">
                <p className="text-lg text-gray-700 mb-6">
                  Monitor your improvements and achievements.
                </p>
                <div className="mt-auto">
                  <Link href="/progress">
                    <Button className="w-full" variant="outline">View Progress</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          <Card title="Quick Actions" subtitle="Common tasks">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/coach" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
                <h3 className="text-xl font-semibold mb-2">Chat with Coach</h3>
                <p className="text-base text-gray-600">Get guidance and motivation</p>
              </Link>
              <Link href="/library" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
                <h3 className="text-xl font-semibold mb-2">Content Library</h3>
                <p className="text-base text-gray-600">Browse exercises and articles</p>
              </Link>
              <Link href="/onboarding" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
                <h3 className="text-xl font-semibold mb-2">Complete Onboarding</h3>
                <p className="text-base text-gray-600">Set up your profile</p>
              </Link>
              <Link href="/account" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
                <h3 className="text-xl font-semibold mb-2">Account Settings</h3>
                <p className="text-base text-gray-600">Manage your profile</p>
              </Link>
              <Link href="/settings" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
                <h3 className="text-xl font-semibold mb-2">Preferences</h3>
                <p className="text-base text-gray-600">Customize your experience</p>
              </Link>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Not authenticated users see landing page
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-5xl font-bold text-primary mb-4">
            Welcome to Retire Strong
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Your AI-powered wellness platform for adults 50+
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
        <Card title="What is Retire Strong?" subtitle="Your personalized wellness journey">
          <div className="space-y-4 text-lg text-gray-700">
            <p>
              Retire Strong helps you maintain your vitality and independence through personalized exercise plans, 
              daily check-ins, and AI-powered coaching tailored to your unique needs.
            </p>
            <p>
              Whether you're looking to improve strength, flexibility, balance, or overall wellness, 
              we're here to support your journey every step of the way.
            </p>
          </div>
        </Card>
        <Card title="Features" subtitle="What you'll get">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div className="p-4 border-2 border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Daily Sessions</h3>
              <p className="text-base text-gray-600">Personalized exercises tailored to your goals and abilities</p>
            </div>
            <div className="p-4 border-2 border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">AI Coach</h3>
              <p className="text-base text-gray-600">Get guidance and motivation from your personal wellness coach</p>
            </div>
            <div className="p-4 border-2 border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-base text-gray-600">Monitor your improvements and celebrate your achievements</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

