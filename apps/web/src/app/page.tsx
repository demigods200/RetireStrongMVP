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
        <div className="text-center py-16 sm:py-20">
          <p className="text-xl sm:text-2xl text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  // Authenticated users see dashboard/welcome view
  if (authenticated) {
    return (
      <Layout>
        <div className="content-spacing">
          <div className="text-center py-8 sm:py-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-6">
              Welcome Back!
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Ready to build on yesterday's progress?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/today">
                <Button size="lg">Go to Today's Session</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
            <div className="flex">
              <Card title="Today" subtitle="Your daily movement" className="w-full">
                <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                  Today's exercises are ready and waiting for you.
                </p>
                <div className="mt-auto">
                  <Link href="/today">
                    <Button className="w-full">Start Today's Session</Button>
                  </Link>
                </div>
              </Card>
            </div>

            <div className="flex">
              <Card title="Your Plan" subtitle="This week's focus" className="w-full">
                <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                  Review and adjust your personalized movement plan.
                </p>
                <div className="mt-auto">
                  <Link href="/plan">
                    <Button className="w-full" variant="outline">View Plan</Button>
                  </Link>
                </div>
              </Card>
            </div>

            <div className="flex">
              <Card title="Progress" subtitle="Your gains" className="w-full">
                <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                  See how your strength, balance, and consistency are building.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Link href="/coach" className="block p-5 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-soft transition-all duration-200 bg-gray-50 hover:bg-white">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">Talk with Your Coach</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">Get personalized guidance and support</p>
              </Link>
              <Link href="/library" className="block p-5 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-soft transition-all duration-200 bg-gray-50 hover:bg-white">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">Movement Library</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">Learn about exercises and their benefits</p>
              </Link>
              <Link href="/onboarding" className="block p-5 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-soft transition-all duration-200 bg-gray-50 hover:bg-white">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">Get Started</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">Tell us about your goals and abilities</p>
              </Link>
              <Link href="/account" className="block p-5 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-soft transition-all duration-200 bg-gray-50 hover:bg-white">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">Account Settings</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">Manage your profile</p>
              </Link>
              <Link href="/settings" className="block p-5 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-soft transition-all duration-200 bg-gray-50 hover:bg-white">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">Preferences</h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">Customize your experience</p>
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
      <div className="content-spacing">
        <div className="text-center py-12 sm:py-16 lg:py-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-6">
            Welcome to Retire Strong
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
            Build strength, balance, and confidence for the life you want to live
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
        <Card title="What is Retire Strong?" subtitle="Movement for independence">
          <div className="space-y-5 sm:space-y-6 text-lg sm:text-xl text-gray-700 leading-relaxed">
            <p>
              Retire Strong helps you build and maintain the strength, balance, and confidence you need for the activities that matter most—
              whether that's climbing stairs easily, playing with grandchildren, traveling, or simply feeling capable in your daily life.
            </p>
            <p>
              Through personalized exercise plans and supportive coaching, we help you stay independent and active on your own terms.
              No gimmicks, no miracle claims—just evidence-based movement tailored to your goals and abilities.
            </p>
          </div>
        </Card>
        <Card title="How We Support You" subtitle="Your path to sustained vitality">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-2">
            <div className="p-5 sm:p-6 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:shadow-soft transition-all duration-200">
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-900">Personalized Movement Plans</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">Exercises designed for your goals, abilities, and daily life—from climbing stairs to carrying groceries</p>
            </div>
            <div className="p-5 sm:p-6 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:shadow-soft transition-all duration-200">
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-900">Supportive Coaching</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">Evidence-based guidance that respects your experience and celebrates your progress</p>
            </div>
            <div className="p-5 sm:p-6 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:shadow-soft transition-all duration-200">
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-900">Adaptive Progression</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">Your plan adjusts based on how you're feeling and what you're achieving</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

