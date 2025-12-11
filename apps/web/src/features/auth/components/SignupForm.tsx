"use client";

import React, { useState } from "react";
import { Button, Card } from "@retire-strong/shared-ui";
import { useRouter } from "next/navigation";

export const SignupForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store userId for onboarding
        if (data.data?.userId) {
          localStorage.setItem("userId", data.data.userId);
        }
        // Store email for verification
        if (formData.email) {
          localStorage.setItem("signupEmail", formData.email);
        }
        // Check if email verification is required
        if (data.data?.requiresVerification) {
          // Redirect to verification page
          router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
        } else {
          // Redirect to onboarding if already verified
          router.push("/onboarding");
        }
      } else {
        setError(data.error?.message || "Signup failed");
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
    <Card title="Create Your Account" subtitle="Join Retire Strong today">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl text-base sm:text-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="firstName" className="block text-lg sm:text-xl font-semibold text-gray-700 mb-3">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-lg sm:text-xl font-semibold text-gray-700 mb-3">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            placeholder="Enter your last name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-lg sm:text-xl font-semibold text-gray-700 mb-3">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-lg sm:text-xl font-semibold text-gray-700 mb-3">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            placeholder="At least 8 characters"
          />
          <p className="mt-2 text-sm sm:text-base text-gray-600">Password must be at least 8 characters long</p>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        <p className="text-center text-base sm:text-lg text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors duration-200">
            Sign in here
          </a>
        </p>
      </form>
    </Card>
  );
};

