"use client";

import React, { useState, useEffect } from "react";
import { Button, Card } from "@retire-strong/shared-ui";
import { useRouter, useSearchParams } from "next/navigation";

export const VerifyEmailForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get("email");
    const storedEmail = localStorage.getItem("signupEmail");
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem("signupEmail", emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !code) {
      setError("Please enter your email and verification code");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Clear stored email
        localStorage.removeItem("signupEmail");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 2000);
      } else {
        setError(data.error?.message || "Verification failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError(null);
    setResending(true);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setError(null);
        alert("Verification code sent! Please check your email.");
      } else {
        setError(data.error?.message || "Failed to resend code");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <Card title="Email Verified!" subtitle="Your account is now active">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-lg text-gray-700">
            Your email has been successfully verified. Redirecting to login...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Verify Your Email" subtitle="Check your inbox for the verification code">
      <form onSubmit={handleVerify} className="space-y-4">
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
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label htmlFor="code" className="block text-lg font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            id="code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="123456"
            maxLength={6}
          />
          <p className="mt-1 text-sm text-gray-600">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </Button>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending || !email}
            className="text-primary hover:text-primary-dark font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
          <p className="text-sm text-gray-600">
            Didn't receive the code? Check your spam folder or click "Resend Code"
          </p>
        </div>

        <p className="text-center text-base text-gray-600">
          Already verified?{" "}
          <a href="/login" className="text-primary hover:text-primary-dark font-semibold">
            Sign in here
          </a>
        </p>
      </form>
    </Card>
  );
};

