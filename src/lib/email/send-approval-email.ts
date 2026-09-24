import { Resend } from "resend";

// Names come from what a provider typed at sign-up, so they are escaped
// before going into the HTML body — a display name is not markup.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendApprovalEmail({
  to,
  providerName,
  facilityName,
  completionPct,
  kind = "new_listing",
}: {
  to: string;
  providerName: string;
  facilityName: string;
  completionPct: number;
  // A claim hands over a listing that was already complete and public; a new
  // listing has just been published from the provider's own submission. The
  // "finish your remaining steps" message only makes sense for the second.
  kind?: "claim" | "new_listing";
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured — skipping approval email");
    return { skipped: true };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || "notifications@tiruhealth.com";
    const name = escapeHtml(providerName);
    const facility = escapeHtml(facilityName);

    const body =
      kind === "claim"
        ? `<p>We've confirmed you with <strong>${facility}</strong>. You now manage its listing on the
          Tiru Health Medical Directory, and it shows the Facility Managed badge.</p>
          <p>You can update services, hours, contact details, doctors and photos yourself —
          anything you save appears on the public listing straight away.</p>`
        : `<p><strong>${facility}</strong> has been approved and is now live on the
          Tiru Health Medical Directory with the Facility Managed badge.</p>
          <p>Your profile is currently ${completionPct}% complete. Complete your remaining
          steps (Doctors & Staff, additional photos) to reach 100% and give patients the
          most complete picture of your facility.</p>`;

    await resend.emails.send({
      from: `Tiru Health Medical Directory <${fromAddress}>`,
      to,
      subject:
        kind === "claim"
          ? `You now manage ${facilityName} on Tiru Health Medical Directory`
          : `🎉 ${facilityName} is now live on Tiru Health Medical Directory!`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0f766e;">Congratulations, ${name}!</h2>
          ${body}
          <p style="margin-top: 24px;">
            <a href="https://tiru-med-directory.vercel.app/provider/${kind === "claim" ? "listing" : "dashboard"}"
               style="background: #0f766e; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; display: inline-block;">
              ${kind === "claim" ? "Edit your listing →" : "Go to your dashboard →"}
            </a>
          </p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 32px;">
            Tiru Health Medical Directory — Addis Ababa
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
