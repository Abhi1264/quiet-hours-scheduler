import { NextRequest, NextResponse } from "next/server";
import { sendQuietBlockReminder, sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, ...data } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let result;

    if (type === "welcome") {
      result = await sendWelcomeEmail(email, data.name || "Test User");
    } else if (type === "reminder") {
      result = await sendQuietBlockReminder({
        userEmail: email,
        userName: data.name || "Test User",
        blockTitle: data.title || "Test Study Session",
        blockDescription:
          data.description || "This is a test quiet block reminder",
        startTime: data.startTime || "2:00 PM",
        endTime: data.endTime || "3:00 PM",
        date: data.date || "Today",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid email type" },
        { status: 400 },
      );
    }

    if (result.success) {
      return NextResponse.json({
        message: "Email sent successfully",
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: result.error,
        },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
