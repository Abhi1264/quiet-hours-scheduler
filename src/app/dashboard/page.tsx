import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, Mail } from "lucide-react";
import { parseISO, isToday } from "date-fns";
import { DashboardClient } from "@/components/DashboardClient";
import { DashboardHeader } from "@/components/DashboardHeader";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login
  if (!user) {
    redirect("/login");
  }

  // Fetch quiet blocks server-side
  const { data: quietBlocks } = await supabase
    .from("quiet_blocks")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  return (
    <div className="min-h-screen bg-neutral-50">
      <DashboardHeader user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || "there"}!
          </h2>
          <p className="text-neutral-600">
            Manage your quiet study sessions and stay focused on your goals.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quietBlocks?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active quiet blocks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Sessions
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quietBlocks?.filter((block) => isToday(parseISO(block.date)))
                  .length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Notifications
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                Email reminders enabled
              </p>
            </CardContent>
          </Card>
        </div>

        <DashboardClient initialQuietBlocks={quietBlocks || []} />
      </main>
    </div>
  );
}
