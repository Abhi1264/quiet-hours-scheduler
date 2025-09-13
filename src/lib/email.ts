import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface QuietBlockEmailData {
  userEmail: string;
  userName: string;
  blockTitle: string;
  blockDescription?: string;
  startTime: string;
  endTime: string;
  date: string;
}

export async function sendQuietBlockReminder(data: QuietBlockEmailData) {
  try {
    const {
      userEmail,
      blockTitle,
      blockDescription,
      startTime,
      endTime,
      date,
    } = data;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">🔔 Quiet Hours Reminder</h1>
          <p style="color: #6b7280; font-size: 16px;">Your focused study session starts in 10 minutes!</p>
        </div>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 15px;">${blockTitle}</h2>
          ${blockDescription ? `<p style="color: #4b5563; margin-bottom: 15px;">${blockDescription}</p>` : ""}
          
          <div style="display: flex; gap: 20px; margin-bottom: 15px;">
            <div>
              <strong style="color: #374151;">📅 Date:</strong>
              <span style="color: #6b7280; margin-left: 8px;">${date}</span>
            </div>
          </div>
          
          <div style="display: flex; gap: 20px;">
            <div>
              <strong style="color: #374151;">⏰ Time:</strong>
              <span style="color: #6b7280; margin-left: 8px;">${startTime} - ${endTime}</span>
            </div>
          </div>
        </div>
        
        <div style="background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; color: #1e40af;">
            <strong>💡 Tip:</strong> Take a moment to prepare your study materials and find a quiet space. 
            Turn off notifications and get ready to focus!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            This reminder was sent from your Quiet Hours Scheduler.<br>
            Stay focused and make the most of your study time! 🎯
          </p>
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: "Quiet Hours Scheduler <quiethoursscheduler@donotreply.abhinavkc.tech>",
      to: [userEmail],
      subject: `🔔 Reminder: "${blockTitle}" starts in 10 minutes`,
      html: emailContent,
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">🎉 Welcome to Quiet Hours Scheduler!</h1>
          <p style="color: #6b7280; font-size: 18px;">Hello ${userName}, you're all set to boost your productivity!</p>
        </div>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Getting Started</h2>
          <ul style="color: #4b5563; line-height: 1.6;">
            <li><strong>Create your first quiet block:</strong> Schedule focused study sessions</li>
            <li><strong>Get reminders:</strong> Receive email notifications 10 minutes before each session</li>
            <li><strong>Stay organized:</strong> Manage all your study blocks from one dashboard</li>
            <li><strong>Build habits:</strong> Set up recurring sessions for consistent learning</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Go to Dashboard
          </a>
        </div>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; color: #047857;">
            <strong>💡 Pro Tip:</strong> Start with short 25-30 minute sessions and gradually increase the duration 
            as you build your focus habits!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            Happy studying! 📚<br>
            The Quiet Hours Scheduler Team
          </p>
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: "Quiet Hours Scheduler <quiethoursscheduler@donotreply.abhinavkc.tech>",
      to: [userEmail],
      subject: "🎉 Welcome to Quiet Hours Scheduler!",
      html: emailContent,
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error };
  }
}
