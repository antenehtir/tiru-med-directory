import { Resend } from "resend";

export async function sendApprovalEmail({
  to,
  providerName,
  facilityName,
  completionPct,
}: {
  to: string;
  providerName: string;
  facilityName: string;
  completionPct: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured — skipping approval email");
    return { skipped: true };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || "notifications@tiruhealth.com";

    await resend.emails.send({
      from: `Tiru Medical Directory <${fromAddress}>`,
      to,
      subject: `🎉 ${facilityName} is now Official on Tiru Medical Directory!`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0f766e;">Congratulations, ${providerName}!</h2>
          <p><strong>${facilityName}</strong> has been approved and is now live on the
          Tiru Medical Directory with the Official badge.</p>
          <p>Your profile is currently ${completionPct}% complete. Complete your remaining
          steps (Doctors & Staff, additional photos) to reach 100% and give patients the
          most complete picture of your facility.</p>
          <p style="margin-top: 24px;">
            <a href="https://tiru-med-directory.vercel.app/provider/dashboard"
               style="background: #0f766e; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; display: inline-block;">
              Go to your dashboard →
            </a>
          </p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 32px;">
            Tiru Medical Directory — Addis Ababa
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send approval email:", error);
    return { error };
  }
}
