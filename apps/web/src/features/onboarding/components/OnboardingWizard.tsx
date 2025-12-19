"use client";

import React, { useState } from "react";
import { Button } from "@retire-strong/shared-ui";
import { useRouter } from "next/navigation";
import type { OnboardingData } from "@retire-strong/shared-api";
import { getApiUrl } from "@/lib/api-client";

interface OnboardingWizardProps {
  userId: string;
}

const STEPS = [
  { id: 1, title: "About You", description: "Tell us a bit about yourself" },
  { id: 2, title: "Health & Activity", description: "Your current health status" },
  { id: 3, title: "Goals", description: "What you want to achieve" },
  { id: 4, title: "Schedule", description: "When you prefer to exercise" },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userId }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    demographics: {
      age: 60,
      gender: "prefer_not_to_say",
      location: "",
    },
    healthContext: {
      activityLevel: "light",
      healthConditions: [],
      mobilityLimitations: [],
      equipmentAvailable: [],
    },
    goals: [],
    schedulePreferences: {
      preferredDays: [],
      preferredTime: "flexible",
      sessionDuration: 30,
    },
  });

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const canContinue = () => {
    if (currentStep === 1) {
      const age = formData.demographics?.age;
      const gender = formData.demographics?.gender;
      if (!age || age < 50 || age > 100) return false;
      if (!gender) return false;
    }

    if (currentStep === 2) {
      if (!formData.healthContext?.activityLevel) return false;
    }

    if (currentStep === 3) {
      if (!formData.goals || formData.goals.length === 0) return false;
    }

    if (currentStep === 4) {
      const schedule = formData.schedulePreferences;
      if (!schedule?.preferredDays || schedule.preferredDays.length === 0) return false;
      if (!schedule.sessionDuration || schedule.sessionDuration < 10) return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/users/onboarding"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          onboardingData: formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Store the result in localStorage for the result page
        localStorage.setItem("onboardingResult", JSON.stringify(data.data));
        // Redirect to result page
        router.push("/onboarding/result");
      } else {
        alert(data.error?.message || "Failed to complete onboarding");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (!canContinue()) return;
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;
  const activeStep = STEPS[currentStep - 1];

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">Welcome to Retire Strong</h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">Let's create your personalized wellness plan</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10 sm:mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base sm:text-lg font-semibold text-gray-700">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-base sm:text-lg font-semibold text-primary">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out shadow-soft"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-medium border border-gray-200 overflow-hidden">
          {/* Step Header */}
          <div className="px-6 sm:px-8 lg:px-10 py-6 sm:py-8 border-b border-gray-200 bg-gray-50">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{activeStep?.title}</h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">{activeStep?.description}</p>
          </div>

          {/* Step Content */}
          <div className="px-6 sm:px-8 lg:px-10 py-8 sm:py-10 lg:py-12">
            {currentStep === 1 && (
              <DemographicsStep
                data={formData.demographics || { age: 60, gender: "prefer_not_to_say", location: "" }}
                onChange={(data) => updateFormData({ demographics: data })}
              />
            )}

            {currentStep === 2 && (
              <HealthContextStep
                data={
                  formData.healthContext || {
                    activityLevel: "light",
                    healthConditions: [],
                    mobilityLimitations: [],
                    equipmentAvailable: [],
                  }
                }
                onChange={(data) => updateFormData({ healthContext: data })}
              />
            )}

            {currentStep === 3 && (
              <GoalsStep
                data={formData.goals || []}
                onChange={(goals) => updateFormData({ goals })}
              />
            )}

            {currentStep === 4 && (
              <ScheduleStep
                data={
                  formData.schedulePreferences || {
                    preferredDays: [],
                    preferredTime: "flexible",
                    sessionDuration: 30,
                  }
                }
                onChange={(data) => updateFormData({ schedulePreferences: data })}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 sm:px-8 lg:px-10 py-6 sm:py-8 border-t border-gray-200 bg-gray-50 flex justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
              className="min-w-[100px]"
            >
              Previous
            </Button>

            <Button
              onClick={nextStep}
              disabled={loading || !canContinue()}
              size="lg"
              className="min-w-[120px]"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : currentStep === STEPS.length ? (
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

// Step Components
const DemographicsStep: React.FC<{
  data: OnboardingData["demographics"];
  onChange: (data: OnboardingData["demographics"]) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Age */}
      <div>
        <label htmlFor="age" className="block text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Age <span className="text-red-500">*</span>
        </label>
        <input
          id="age"
          type="number"
          min={50}
          max={100}
          value={data?.age || 60}
          onChange={(e) => {
            const age = parseInt(e.target.value, 10);
            if (!isNaN(age) && age >= 50 && age <= 100) {
              onChange({ ...data, age });
            }
          }}
          className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
          placeholder="Enter your age"
        />
        <p className="mt-3 text-sm sm:text-base text-gray-500">Must be between 50 and 100</p>
      </div>

      {/* Gender */}
      <div>
        <label htmlFor="gender" className="block text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Gender <span className="text-red-500">*</span>
        </label>
        <select
          id="gender"
          value={data?.gender || "prefer_not_to_say"}
          onChange={(e) => onChange({ ...data, gender: e.target.value as any })}
          className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white appearance-none"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Location <span className="text-sm sm:text-base font-normal text-gray-500">(Optional)</span>
        </label>
        <input
          id="location"
          type="text"
          value={data?.location || ""}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
          className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
          placeholder="City, State"
        />
      </div>
    </div>
  );
};

const HealthContextStep: React.FC<{
  data: OnboardingData["healthContext"];
  onChange: (data: OnboardingData["healthContext"]) => void;
}> = ({ data, onChange }) => {
  const activityLevels = [
    { value: "sedentary", label: "Sedentary", description: "Little to no exercise" },
    { value: "light", label: "Light", description: "Exercise 1-3 days per week" },
    { value: "moderate", label: "Moderate", description: "Exercise 3-5 days per week" },
    { value: "active", label: "Active", description: "Exercise 6-7 days per week" },
  ];

  return (
    <div className="space-y-8">
      {/* Activity Level */}
      <div>
        <label className="block text-lg sm:text-xl font-semibold text-gray-900 mb-5">
          Current Activity Level <span className="text-red-500">*</span>
        </label>
        <div className="space-y-4">
          {activityLevels.map((level) => {
            const isSelected = data?.activityLevel === level.value;
            return (
              <button
                key={level.value}
                type="button"
                onClick={() => onChange({ ...data, activityLevel: level.value as any })}
                className={`w-full px-6 py-4.5 rounded-xl border-2 text-left transition-all duration-200 relative ${isSelected
                    ? "border-primary bg-white shadow-soft"
                    : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-soft"
                  }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl" />
                )}
                <div>
                  <div className="font-semibold text-lg sm:text-xl text-gray-900 mb-1.5">{level.label}</div>
                  <div className="text-sm sm:text-base text-gray-600 leading-relaxed">{level.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Health Conditions */}
      <div>
        <label htmlFor="healthConditions" className="block text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Health Conditions <span className="text-sm sm:text-base font-normal text-gray-500">(Optional)</span>
        </label>
        <input
          id="healthConditions"
          type="text"
          defaultValue={data?.healthConditions?.join(", ") || ""}
          placeholder="e.g., Arthritis, High blood pressure, Diabetes"
          className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
          onBlur={(e) => {
            const conditions = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
            onChange({ ...data, healthConditions: conditions });
          }}
        />
        <p className="mt-3 text-sm sm:text-base text-gray-500">Separate multiple conditions with commas</p>
      </div>
    </div>
  );
};

const GoalsStep: React.FC<{
  data: string[];
  onChange: (goals: string[]) => void;
}> = ({ data, onChange }) => {
  const availableGoals = [
    "Improve strength",
    "Increase flexibility",
    "Better balance",
    "Reduce pain",
    "Maintain independence",
    "Travel readiness",
    "Energy and vitality",
    "Weight management",
  ];

  const toggleGoal = (goal: string) => {
    if (data.includes(goal)) {
      onChange(data.filter((g) => g !== goal));
    } else {
      onChange([...data, goal]);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <label className="block text-lg sm:text-xl font-semibold text-gray-900 mb-5">
          Select all that apply: <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableGoals.map((goal) => {
            const isSelected = data.includes(goal);
            return (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                className={`w-full px-6 py-4.5 rounded-xl border-2 text-left transition-all duration-200 relative ${isSelected
                    ? "border-primary bg-white shadow-soft"
                    : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-soft"
                  }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl" />
                )}
                <span className="font-semibold text-lg sm:text-xl text-gray-900">{goal}</span>
              </button>
            );
          })}
        </div>
      </div>

      {data.length === 0 && (
        <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <p className="text-sm sm:text-base font-semibold text-amber-800">Please select at least one goal to continue</p>
        </div>
      )}
    </div>
  );
};

const ScheduleStep: React.FC<{
  data: OnboardingData["schedulePreferences"];
  onChange: (data: OnboardingData["schedulePreferences"]) => void;
}> = ({ data, onChange }) => {
  const days = [
    { value: "monday", label: "Mon" },
    { value: "tuesday", label: "Tue" },
    { value: "wednesday", label: "Wed" },
    { value: "thursday", label: "Thu" },
    { value: "friday", label: "Fri" },
    { value: "saturday", label: "Sat" },
    { value: "sunday", label: "Sun" },
  ];

  const toggleDay = (day: string) => {
    const currentDays = data?.preferredDays || [];
    if (currentDays.includes(day)) {
      onChange({ ...data, preferredDays: currentDays.filter((d) => d !== day) });
    } else {
      onChange({ ...data, preferredDays: [...currentDays, day] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Preferred Days */}
      <div>
        <label className="block text-lg sm:text-xl font-semibold text-gray-900 mb-5">
          Preferred Days <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {days.map((day) => {
            const isSelected = data?.preferredDays?.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border-2 font-semibold transition-all duration-200 text-base sm:text-lg min-h-[44px] ${isSelected
                    ? "border-primary bg-primary text-white shadow-soft"
                    : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/5"
                  }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
        {(!data?.preferredDays || data.preferredDays.length === 0) && (
          <p className="mt-4 text-sm sm:text-base text-amber-600">Please select at least one day</p>
        )}
      </div>

      {/* Time and Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <label htmlFor="preferredTime" className="block text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Preferred Time
          </label>
          <select
            id="preferredTime"
            value={data?.preferredTime || "flexible"}
            onChange={(e) => onChange({ ...data, preferredTime: e.target.value as any })}
            className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        <div>
          <label htmlFor="sessionDuration" className="block text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Session Duration
          </label>
          <div className="relative">
            <input
              id="sessionDuration"
              type="number"
              min={10}
              max={60}
              step={5}
              value={data?.sessionDuration || 30}
              onChange={(e) => onChange({ ...data, sessionDuration: parseInt(e.target.value, 10) || 30 })}
              className="w-full px-5 py-3.5 pr-20 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-base">minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

