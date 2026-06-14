import type { Facility, FacilityContactChannel } from "@/types/facility";
import {
  createPublicContactActions,
  getExternalLinkProps,
} from "@/lib/contact-actions";

type FacilityActionPanelProps = {
  facility: Facility;
};

export function FacilityActionPanel({ facility }: FacilityActionPanelProps) {
  const contactChannels = facility.contactChannels ?? [];
  const contactActions = createPublicContactActions(contactChannels);
  const primaryActions = contactActions.filter((action) =>
    ["phone", "maps", "website", "email", "whatsapp"].includes(action.kind),
  );

  return (
    <aside className="rounded-2xl border border-border bg-card p-5 shadow-[0_12px_30px_rgba(17,24,39,0.035)] sm:p-6">
      <h2 className="text-2xl font-semibold leading-tight text-foreground">
        Contact options
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Contact details are being verified. Use published channels when they
        are available.
      </p>

      {primaryActions.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {primaryActions.map((action, index) => (
            <a
              className={`flex min-h-12 items-center justify-center rounded-md px-5 text-center text-sm font-semibold shadow-sm ${
                index === 0
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground"
              }`}
              href={action.href}
              key={action.id}
              {...getExternalLinkProps(action)}
            >
              {action.label}
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-border bg-muted p-4 text-sm leading-6 text-muted-foreground">
          Contact details are being verified.
        </p>
      )}

      {contactChannels.length > 0 ? (
        <div className="mt-5 border-t border-border pt-5">
          <p className="text-sm font-semibold text-foreground">
            Public contact channels
          </p>
          <div className="mt-3 grid gap-2">
            {contactChannels.map((channel) => {
              const channelActions = createPublicContactActions([channel]);

              if (channelActions.length === 0) {
                return null;
              }

              return (
              <div
                className="rounded-xl border border-border bg-muted p-3 text-sm leading-6"
                key={channel.id}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-foreground">
                    {channel.label}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                    {getChannelTypeLabel(channel)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {channelActions.map((action) => (
                    <a
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground transition hover:border-strong-border"
                      href={action.href}
                      key={action.id}
                      {...getExternalLinkProps(action)}
                    >
                      {action.label}
                    </a>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function getChannelTypeLabel(channel: FacilityContactChannel): string {
  if (channel.channelType === "social" && channel.label === "LinkedIn") {
    return "LinkedIn";
  }

  if (channel.channelType === "maps") {
    return "Maps";
  }

  if (channel.channelType === "whatsapp") {
    return "WhatsApp";
  }

  if (channel.channelType === "email") {
    return "Email";
  }

  return channel.channelType;
}
