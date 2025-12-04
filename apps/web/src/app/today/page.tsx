import { Layout } from "@retire-strong/shared-ui";
import { Card } from "@retire-strong/shared-ui";

export default function TodayPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Today</h1>
        <Card title="Your Daily Session" subtitle="Ready to get started?">
          <p className="text-lg text-gray-700">
            Your personalized session plan will appear here once you complete onboarding.
          </p>
        </Card>
        <Card title="Daily Check-in" subtitle="How are you feeling today?">
          <p className="text-lg text-gray-700">
            Check-in form will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

