"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@retire-strong/shared-ui";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/motivation/quiz");
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
      const answerArray: QuizAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      const response = await fetch("/api/motivation/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          answers: answerArray,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Store persona data for reveal screen
        localStorage.setItem("coachPersona", JSON.stringify(data.data.persona));
        router.push("/motivation/result");
      } else {
        alert(data.error?.message || "Failed to submit quiz");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Motivation Quiz</h1>
          <p className="text-lg text-gray-600">Help us understand what motivates you</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900">{currentQuestion.text}</h2>
          </div>

          <div className="px-8 py-10">
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full px-5 py-4 rounded-lg border-2 text-left transition-all relative ${
                      isSelected
                        ? "border-primary bg-white shadow-sm"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
                    )}
                    <span className="font-medium text-base text-gray-900">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center gap-4">
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

