import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendQuietBlockReminder } from "@/lib/email";
import { Database } from "@/lib/database.types";

// Create a Supabase client with service role key for server-side operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    // Verify this is coming from a trusted source (you might want to add auth headers)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    // Get all pending notifications scheduled for the next 10 minutes
    const { data: notifications, error: notificationsError } = await supabase
      .from("email_notifications")
      .select(
        `
        id,
        user_id,
        scheduled_time,
        quiet_blocks (
          id,
          title,
          description,
          start_time,
          end_time,
          date
        ),
        profiles (
          email,
          full_name
        )
      `,
      )
      .eq("status", "pending")
      .gte("scheduled_time", now.toISOString())
      .lte("scheduled_time", tenMinutesFromNow.toISOString());

    if (notificationsError) {
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 },
      );
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({
        message: "No notifications to send",
        processed: 0,
      });
    }

    let successCount = 0;
    let failureCount = 0;

    // Process each notification
    for (const notification of notifications) {
      try {
        const quietBlock = notification.quiet_blocks;
        const profile = notification.profiles;

        if (!quietBlock || !profile) {
          continue;
        }

        // Format time for display
        const formatTime = (timeString: string) => {
          const [hours, minutes] = timeString.split(":");
          const date = new Date();
          date.setHours(parseInt(hours), parseInt(minutes));
          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        };

        // Format date for display
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        };

        // Send the email
        const emailResult = await sendQuietBlockReminder({
          userEmail: profile.email,
          userName: profile.full_name || "there",
          blockTitle: quietBlock.title,
          blockDescription: quietBlock.description || undefined,
          startTime: formatTime(quietBlock.start_time),
          endTime: formatTime(quietBlock.end_time),
          date: formatDate(quietBlock.date),
        });

        if (emailResult.success) {
          // Mark notification as sent
          await supabase
            .from("email_notifications")
            .update({
              status: "sent",
              sent_at: now.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq("id", notification.id);

          successCount++;
        } else {
          // Mark notification as failed
          await supabase
            .from("email_notifications")
            .update({
              status: "failed",
              error_message: emailResult.error
                ? String(emailResult.error)
                : "Unknown error",
              updated_at: now.toISOString(),
            })
            .eq("id", notification.id);

          failureCount++;
        }
      } catch (error) {
        console.error("Error processing notification:", notification.id, error);

        // Mark notification as failed
        await supabase
          .from("email_notifications")
          .update({
            status: "failed",
            error_message:
              error instanceof Error ? error.message : "Unknown error",
            updated_at: now.toISOString(),
          })
          .eq("id", notification.id);

        failureCount++;
      }
    }

    return NextResponse.json({
      message: "Notifications processed",
      total: notifications.length,
      success: successCount,
      failures: failureCount,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
