"use client";

import { useState } from "react";
import { Button, Card } from "@retire-strong/shared-ui";
import { getApiUrl } from "@/lib/api-client";

interface SessionCheckinFormProps {
  sessionId: string;
  userId: string;
  movementsTotal: number;
  onComplete?: () => void;
}

export function SessionCheckinForm({
  sessionId,
  userId,
  movementsTotal,
  onComplete
}: SessionCheckinFormProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    adherence: "completed-full" as const,
    movementsCompleted: movementsTotal,
    difficulty: "just_right" as const,
    painLevel: "none" as const,
    painLocations: [] as string[],
    painNotes: "",
    energyBefore: "moderate" as const,
    energyAfter: "moderate" as const,
    perceivedExertion: 5,
    notes: "",
    enjoyed: true,
    sessionDurationMinutes: 20,
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(getApiUrl("/checkins/session"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sessionId,
          ...formData,
          movementsTotal,
        }),
      });

      if (response.ok) {
        onComplete?.();
      } else {
        console.error("Failed to submit check-in");
      }
    } catch (error) {
      console.error("Error submitting check-in:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          How did the session go?
        </label>
        <div className="space-y-2">
          {[
            { value: "completed-full", label: "✓ Completed all exercises" },
            { value: "completed-modified", label: "✓ Completed with modifications" },
            { value: "completed-partial", label: "✓ Completed some exercises" },
            { value: "skipped-planned", label: "↻ Skipped (planned rest)" },
            { value: "skipped-unplanned", label: "⊘ Skipped (unexpected)" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, adherence: option.value as any })}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${formData.adherence === option.value
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <span className="text-lg">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {formData.adherence.startsWith("completed") && (
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Movements completed: {formData.movementsCompleted} of {movementsTotal}
          </label>
          <input
            type="range"
            min="0"
            max={movementsTotal}
            value={formData.movementsCompleted}
            onChange={(e) => setFormData({ ...formData, movementsCompleted: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      )}

      <Button
        onClick={() => setStep(2)}
        size="lg"
        className="w-full"
      >
        Next
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          How challenging was today&apos;s session?
        </label>
        <div className="space-y-2">
          {[
            { value: "too_easy", label: "😴 Too Easy", desc: "I could do more" },
            { value: "just_right", label: "👍 Just Right", desc: "Perfect challenge" },
            { value: "too_hard", label: "😓 Too Hard", desc: "Struggled to complete" },
            { value: "varied", label: "🔄 Mixed", desc: "Some easy, some hard" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, difficulty: option.value as any })}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${formData.difficulty === option.value
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{option.label}</span>
                <span className="text-sm text-gray-600">{option.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Perceived exertion (1-10)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            value={formData.perceivedExertion}
            onChange={(e) => setFormData({ ...formData, perceivedExertion: parseInt(e.target.value) })}
            className="flex-1"
          />
          <span className="text-2xl font-bold text-primary w-12 text-center">
            {formData.perceivedExertion}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          1 = Very light • 10 = Maximum effort
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={() => setStep(3)} size="lg" className="flex-1">
          Next
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Any pain or discomfort?
        </label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { value: "none", label: "😊 None" },
            { value: "mild", label: "🙂 Mild" },
            { value: "moderate", label: "😐 Moderate" },
            { value: "severe", label: "😣 Severe" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, painLevel: option.value as any })}
              className={`p-3 border-2 rounded-lg transition-all duration-200 ${formData.painLevel === option.value
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {formData.painLevel !== "none" && (
          <div className="space-y-3">
            <label className="block text-base font-medium text-gray-700">
              Where did you feel discomfort?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["knee-left", "knee-right", "lower-back", "shoulder-left", "shoulder-right", "hip", "neck", "other"].map((location) => (
                <button
                  key={location}
                  onClick={() => {
                    const newLocations = formData.painLocations.includes(location)
                      ? formData.painLocations.filter(l => l !== location)
                      : [...formData.painLocations, location];
                    setFormData({ ...formData, painLocations: newLocations });
                  }}
                  className={`p-2 text-sm border-2 rounded-lg transition-all duration-200 ${formData.painLocations.includes(location)
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  {location.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Additional notes about pain or discomfort..."
              value={formData.painNotes}
              onChange={(e) => setFormData({ ...formData, painNotes: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg"
              rows={3}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={() => setStep(4)} size="lg" className="flex-1">
          Next
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Energy levels
        </label>

        <div className="space-y-4">
          <div>
            <label className="block text-base text-gray-700 mb-2">Before session:</label>
            <div className="flex gap-2">
              {[
                { value: "very_low", label: "Very Low" },
                { value: "low", label: "Low" },
                { value: "moderate", label: "Moderate" },
                { value: "high", label: "High" },
                { value: "very_high", label: "Very High" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, energyBefore: option.value as any })}
                  className={`flex-1 p-2 text-sm border-2 rounded-lg transition-all duration-200 ${formData.energyBefore === option.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base text-gray-700 mb-2">After session:</label>
            <div className="flex gap-2">
              {[
                { value: "very_low", label: "Very Low" },
                { value: "low", label: "Low" },
                { value: "moderate", label: "Moderate" },
                { value: "high", label: "High" },
                { value: "very_high", label: "Very High" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, energyAfter: option.value as any })}
                  className={`flex-1 p-2 text-sm border-2 rounded-lg transition-all duration-200 ${formData.energyAfter === option.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Did you enjoy today&apos;s session?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormData({ ...formData, enjoyed: true })}
            className={`p-4 border-2 rounded-lg transition-all duration-200 ${formData.enjoyed
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
              }`}
          >
            <span className="text-2xl mb-2 block">😊</span>
            <span className="text-base">Yes!</span>
          </button>
          <button
            onClick={() => setFormData({ ...formData, enjoyed: false })}
            className={`p-4 border-2 rounded-lg transition-all duration-200 ${!formData.enjoyed
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
              }`}
          >
            <span className="text-2xl mb-2 block">😕</span>
            <span className="text-base">Not really</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-base font-medium text-gray-700 mb-2">
          Additional notes (optional)
        </label>
        <textarea
          placeholder="Anything else you'd like to share about today&apos;s session?"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full p-3 border-2 border-gray-200 rounded-lg"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          size="lg"
          className="flex-1"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Complete Check-in"}
        </Button>
      </div>
    </div>
  );

  return (
    <Card title="Session Check-in" subtitle={`Step ${step} of 4`}>
      {/* Progress indicator */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-all duration-200 ${s <= step ? "bg-primary" : "bg-gray-200"
              }`}
          />
        ))}
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </Card>
  );
}

