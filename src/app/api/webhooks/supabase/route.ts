import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature if you set one up in Supabase
    // const signature = request.headers.get('x-supabase-signature')

    const { type, table, record } = body;

    // Handle new user registration
    if (type === "INSERT" && table === "profiles") {
      try {
        const { email, full_name } = record;

        if (email) {
          await sendWelcomeEmail(email, full_name || "there");
        }
      } catch {
        // Handle webhook errors silently
      }
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
