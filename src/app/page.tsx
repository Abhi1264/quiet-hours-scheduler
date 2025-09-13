import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Mail, Shield, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-neutral-900 mb-6">
            Quiet Hours Scheduler
          </h1>
          <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
            Create focused study time blocks and get notified 10 minutes before
            each session starts. Perfect for maintaining consistent study habits
            and deep work sessions.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Button asChild size="lg" className="px-8">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="text-center">
              <CardHeader>
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Time Blocks</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create custom quiet study sessions with flexible scheduling
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Smart Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get email notifications 10 minutes before each session
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-lg">No Conflicts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Smart scheduling prevents overlapping notifications
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Zap className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Recurring Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set up daily, weekly, or custom recurring study blocks
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Create Your Schedule
                </h3>
                <p className="text-neutral-600">
                  Set up your quiet study blocks with custom titles and
                  descriptions
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Get Notified</h3>
                <p className="text-neutral-600">
                  Receive email reminders 10 minutes before each session
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Stay Focused</h3>
                <p className="text-neutral-600">
                  Enter your quiet hours and maximize your productivity
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
