"use client";

import React, { useState, useEffect } from "react";
import { Button, Card } from "@retire-strong/shared-ui";
import { useRouter } from "next/navigation";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    // Check URL params on client side
    const params = new URLSearchParams(window.location.search);
    if (params.get("signup") === "success") {
      setSignupSuccess(true);
    }
    if (params.get("verified") === "true") {
      setSignupSuccess(true);
      setError(null);
    }
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store tokens (simplified - in production use httpOnly cookies)
        if (data.data.accessToken) {
          localStorage.setItem("accessToken", data.data.accessToken);
          if (data.data.refreshToken) {
            localStorage.setItem("refreshToken", data.data.refreshToken);
          }
          if (data.data.idToken) {
            localStorage.setItem("idToken", data.data.idToken);
          }
        }

        // Store userId if provided
        if (data.data.user?.userId) {
          localStorage.setItem("userId", data.data.user.userId);
        }

        // Check onboarding status and redirect accordingly
        const onboardingComplete = data.data.user?.onboardingComplete ?? false;
        if (!onboardingComplete) {
          router.push("/onboarding");
        } else {
          router.push("/today");
        }
      } else {
        // Check if user is not confirmed - redirect to verification
        if (data.error?.code === "USER_NOT_CONFIRMED") {
          router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
          return;
        }
        setError(data.error?.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card title="Sign In" subtitle="Welcome back to Retire Strong">
      {signupSuccess && (
        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg text-base mb-4">
          {window.location.search.includes("verified=true")
            ? "Email verified successfully! Please sign in."
            : "Account created successfully! Please sign in."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-base">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </Button>

        <p className="text-center text-base text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-primary hover:text-primary-dark font-semibold">
            Create one here
          </a>
        </p>
      </form>
    </Card>
  );
};

