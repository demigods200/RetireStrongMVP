import { Layout } from "@retire-strong/shared-ui";
import { Card } from "@retire-strong/shared-ui";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <Card title="Account" subtitle="Manage your account">
          <p className="text-lg text-gray-700">
            Account settings will appear here.
          </p>
        </Card>
        <Card title="Preferences" subtitle="Customize your experience">
          <p className="text-lg text-gray-700">
            User preferences will appear here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

