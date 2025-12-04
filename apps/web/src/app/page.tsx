import { Layout } from "@retire-strong/shared-ui";
import { Button, Card } from "@retire-strong/shared-ui";
import Link from "next/link";

export default function Home() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-5xl font-bold text-primary mb-4">
            Retire Strong MVP is running
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Welcome to the AI-powered wellness platform for adults 50+
          </p>
          <Link href="/today">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
        <Card title="Quick Navigation" subtitle="Explore the app">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <Link href="/today" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
              <h3 className="text-xl font-semibold mb-2">Today</h3>
              <p className="text-base text-gray-600">Your daily session and check-in</p>
            </Link>
            <Link href="/plan" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
              <h3 className="text-xl font-semibold mb-2">Plan</h3>
              <p className="text-base text-gray-600">Your weekly exercise plan</p>
            </Link>
            <Link href="/coach" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
              <h3 className="text-xl font-semibold mb-2">Coach</h3>
              <p className="text-base text-gray-600">Chat with your AI coach</p>
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

