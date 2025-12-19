"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@retire-strong/shared-ui";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api-client";

interface QuizQuestion {
  id: string;
  text: string;
  category: string;
  options: { value: number; label: string }[];
}

interface QuizAnswer {
  questionId: string;
  value: number;
}

interface MotivationQuizProps {
  userId: string;
}

export const MotivationQuiz: React.FC<MotivationQuizProps> = ({ userId }) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{
    message: string;
    details?: any;
    code?: string;
    requestId?: string;
    stack?: string;
  } | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(getApiUrl("/motivation/quiz"));
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data.questions);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: number) => {
    const question = questions[currentQuestionIndex];
    if (!question) return;
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Validate that all questions are answered
      if (Object.keys(answers).length !== questions.length) {
        alert(`Please answer all questions before submitting. You've answered ${Object.keys(answers).length} out of ${questions.length} questions.`);
        setSubmitting(false);
        return;
      }

      // Validate answer count (schema requires 10-15 answers)
      if (Object.keys(answers).length < 10) {
        alert(`You need to answer at least 10 questions. You've answered ${Object.keys(answers).length} questions.`);
        setSubmitting(false);
        return;
      }

      if (Object.keys(answers).length > 15) {
        alert(`You can only answer up to 15 questions. You've answered ${Object.keys(answers).length} questions.`);
        setSubmitting(false);
        return;
      }

      // Validate answer values are between 1 and 5
      const invalidAnswers = Object.entries(answers).filter(([_, value]) => value < 1 || value > 5);
      if (invalidAnswers.length > 0) {
        console.error("Invalid answer values:", invalidAnswers);
        alert("Some answers have invalid values. Please ensure all answers are between 1 and 5.");
        setSubmitting(false);
        return;
      }

      const answerArray: QuizAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value: Number(value), // Ensure it's a number
      }));

      // Log the submission data for debugging
      console.log("Submitting quiz with:", {
        userId,
        answerCount: answerArray.length,
        answers: answerArray,
      });

      const response = await fetch(getApiUrl("/motivation/submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          answers: answerArray,
        }),
      });

      // Log the full response for debugging
      const responseText = await response.text();
      console.log("Quiz submission response status:", response.status);
      console.log("Quiz submission response text:", responseText);

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        alert("Error: Invalid response from server. Please try again.");
        setSubmitting(false);
        return;
      }

      // Log the full data for debugging
      console.log("Quiz submission response data:", JSON.stringify(data, null, 2));

      if (!response.ok || !data.success) {
        // Extract error information
        const errorMessage =
          data.error?.message ||
          data.error?.details ||
          (typeof data.error === 'string' ? data.error : null) ||
          data.message ||
          `HTTP ${response.status}: ${response.statusText}` ||
          "Failed to submit quiz";

        // Log comprehensive error details to console
        console.error("=".repeat(60));
        console.error("❌ QUIZ SUBMISSION ERROR");
        console.error("=".repeat(60));
        console.error("Response Status:", response.status, response.statusText);
        console.error("Response OK:", response.ok);
        console.error("Error Code:", data.error?.code || "UNKNOWN");
        console.error("Error Message:", errorMessage);
        console.error("Request ID:", data.error?.requestId || "N/A");
        console.error("Full Error Object:", JSON.stringify(data.error, null, 2));
        console.error("Full Response Data:", JSON.stringify(data, null, 2));
        if (data.error?.stack) {
          console.error("Stack Trace:", data.error.stack);
        }
        console.error("=".repeat(60));

        // Set error state for UI display
        setError({
          message: errorMessage,
          code: data.error?.code,
          details: data.error?.details || data.error,
          requestId: data.error?.requestId,
          stack: data.error?.stack,
        });
        setShowErrorDetails(false); // Start collapsed
        setSubmitting(false);
        return;
      }

      // Store full result for result page
      localStorage.setItem("quizResult", JSON.stringify(data.data));
      // Also store persona separately for backward compatibility
      localStorage.setItem("coachPersona", JSON.stringify(data.data.persona));
      router.push("/motivation/result");
    } catch (error) {
      console.error("=".repeat(60));
      console.error("❌ QUIZ SUBMISSION EXCEPTION");
      console.error("=".repeat(60));
      console.error("Error Type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error Message:", error instanceof Error ? error.message : String(error));
      if (error instanceof Error && error.stack) {
        console.error("Stack Trace:", error.stack);
      }
      console.error("Full Error:", error);
      console.error("=".repeat(60));

      setError({
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        details: error,
        code: "EXCEPTION",
      });
      setShowErrorDetails(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Failed to load quiz questions</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return null;
  }

  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const canContinue = currentAnswer !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">Motivation Quiz</h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">Help us understand what motivates you</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-10 sm:mb-12 bg-red-50 border-2 border-red-200 rounded-xl overflow-hidden shadow-soft">
            <div className="px-6 sm:px-8 py-5 sm:py-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-red-900 mb-3">
                    ❌ Error: {error.message}
                  </h3>
                  {error.code && (
                    <p className="text-sm sm:text-base text-red-700 mb-2">
                      <span className="font-medium">Error Code:</span> {error.code}
                    </p>
                  )}
                  {error.requestId && (
                    <p className="text-sm sm:text-base text-red-700 mb-2">
                      <span className="font-medium">Request ID:</span> {error.requestId}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="ml-4 text-red-700 hover:text-red-900 text-sm sm:text-base font-semibold transition-colors duration-200"
                >
                  {showErrorDetails ? "▼ Hide" : "▶ Show"} Details
                </button>
              </div>

              {showErrorDetails && (
                <div className="mt-5 pt-5 border-t border-red-200">
                  <div className="space-y-4">
                    {error.details && (
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-red-900 mb-2">Error Details:</p>
                        <pre className="bg-red-100 p-4 rounded-xl text-xs sm:text-sm overflow-auto max-h-64 text-red-800">
                          {typeof error.details === 'string'
                            ? error.details
                            : JSON.stringify(error.details, null, 2)}
                        </pre>
                      </div>
                    )}
                    {error.stack && (
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-red-900 mb-2">Stack Trace:</p>
                        <pre className="bg-red-100 p-4 rounded-xl text-xs sm:text-sm overflow-auto max-h-64 text-red-800">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    <div className="pt-3">
                      <p className="text-xs sm:text-sm text-red-600 mb-3 leading-relaxed">
                        💡 <strong>Tip:</strong> Check the browser console (F12) for more detailed logs.
                        All error information has been logged there as well.
                      </p>
                      <button
                        onClick={() => {
                          setError(null);
                          setShowErrorDetails(false);
                        }}
                        className="text-sm sm:text-base text-red-700 hover:text-red-900 font-semibold underline transition-colors duration-200"
                      >
                        Dismiss Error
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-10 sm:mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base sm:text-lg font-semibold text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-base sm:text-lg font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out shadow-soft"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-medium border border-gray-200 overflow-hidden mb-8 sm:mb-10">
          <div className="px-6 sm:px-8 lg:px-10 py-6 sm:py-8 border-b border-gray-200 bg-gray-50">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{currentQuestion.text}</h2>
          </div>

          <div className="px-6 sm:px-8 lg:px-10 py-8 sm:py-10 lg:py-12">
            <div className="space-y-4">
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full px-6 py-4.5 rounded-xl border-2 text-left transition-all duration-200 relative ${isSelected
                        ? "border-primary bg-white shadow-soft"
                        : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-soft"
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl" />
                    )}
                    <span className="font-semibold text-lg sm:text-xl text-gray-900">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="px-6 sm:px-8 lg:px-10 py-6 sm:py-8 border-t border-gray-200 bg-gray-50 flex justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0 || submitting}
              className="min-w-[100px]"
            >
              Previous
            </Button>

            <Button
              onClick={nextQuestion}
              disabled={!canContinue || submitting}
              size="lg"
              className="min-w-[120px]"
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : currentQuestionIndex === questions.length - 1 ? (
                "Complete"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

