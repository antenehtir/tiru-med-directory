"use client";

import { useState, type SVGProps } from "react";
import type { Facility } from "@/types/facility";
import {
  createPublicContactActions,
  getExternalLinkProps,
  type PublicContactAction,
} from "@/lib/contact-actions";

type FacilityActionPanelProps = {
  facility: Facility;
};

function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24" {...props}>
      <line x1="22" x2="11" y1="2" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24" {...props}>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24" {...props}>
      <path d="M15 8.5h2.5V5H15a4 4 0 00-4 4v2H8.5v3.5H11V21h3.5v-6.5h2.5l1-3.5h-3.5V9a.5.5 0 01.5-.5z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24" {...props}>
      <rect height="18" rx="5" width="18" x="3" y="3" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" fill="currentColor" r="0.75" stroke="none" />
    </svg>
  );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24" {...props}>
      <path d="M9 18V5l9-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24" {...props}>
      <rect height="18" rx="2" width="18" x="3" y="3" />
      <line x1="8" x2="8" y1="11" y2="16" />
      <line x1="8" x2="8" y1="8" y2="8.01" />
      <line x1="12" x2="12" y1="11" y2="16" />
      <path d="M12 13.5a2 2 0 014 0V16" />
    </svg>
  );
}

function EmailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24" {...props}>
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <polyline points="22 6 12 13 2 6" />
    </svg>
  );
}

function WebsiteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function BookingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24" {...props}>
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <line x1="3" x2="21" y1="9" y2="9" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="16" x2="16" y1="2" y2="6" />
    </svg>
  );
}

const socialPlatformIcons: Record<
  string,
  (props: SVGProps<SVGSVGElement>) => React.JSX.Element
> = {
  telegram: TelegramIcon,
  whatsapp: WhatsAppIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  linkedin: LinkedInIcon,
};

const tertiaryIcons: Record<
  string,
  (props: SVGProps<SVGSVGElement>) => React.JSX.Element
> = {
  email: EmailIcon,
  website: WebsiteIcon,
  appointment: BookingIcon,
};

function getSocialPlatformKey(action: PublicContactAction): string | null {
  if (action.kind === "whatsapp") {
    return "whatsapp";
  }

  if (action.kind !== "social") {
    return null;
  }

  const label = action.label.toLowerCase();

  return Object.keys(socialPlatformIcons).find((platform) => label.includes(platform)) ?? null;
}

function getTertiaryLabel(kind: string, fallback: string): string {
  if (kind === "email") return "Email";
  if (kind === "website") return "Website";
  if (kind === "appointment") return "Booking";
  return fallback;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function ShareFacilityButton({ facility }: { facility: Facility }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/facilities/${facility.slug}`;
    const shareData = {
      title: facility.name,
      text: `Find ${facility.name} on Tiru — Trace the right care.`,
      url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  }

  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-95"
      onClick={handleShare}
      type="button"
    >
      {copied ? (
        <>
          <svg className="size-4 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-teal-600">Link copied!</span>
        </>
      ) : (
        <>
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="18" cy="19" r="3" strokeLinecap="round" strokeLinejoin="round"/>
            <line strokeLinecap="round" strokeLinejoin="round" x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
            <line strokeLinecap="round" strokeLinejoin="round" x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
          </svg>
          Share this facility
        </>
      )}
    </button>
  );
}

export function FacilityActionPanel({ facility }: FacilityActionPanelProps) {
  const [showMoreNumbers, setShowMoreNumbers] = useState(false);
  const contactChannels = facility.contactChannels ?? [];
  const allActions = createPublicContactActions(contactChannels);

  if (allActions.length === 0) {
    return null;
  }

  const phoneActions = allActions.filter((action) => action.kind === "phone");
  const mapsAction = allActions.find((action) => action.kind === "maps");
  const tertiaryActions = allActions.filter(
    (action) =>
      action.kind === "website" || action.kind === "email" || action.kind === "appointment",
  );
  const socialActions = allActions
    .map((action) => ({ action, platform: getSocialPlatformKey(action) }))
    .filter(
      (entry): entry is { action: PublicContactAction; platform: string } =>
        entry.platform !== null,
    );

  const [primaryPhone, ...secondaryPhones] = phoneActions;

  return (
    <aside className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <div className="grid gap-3">
        {primaryPhone ? (
          <a
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary text-center font-semibold text-primary-foreground transition hover:bg-primary-hover"
            href={primaryPhone.href}
            {...getExternalLinkProps(primaryPhone)}
          >
            📞 Call
          </a>
        ) : null}
        {mapsAction ? (
          <a
            className="flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-primary text-center font-semibold text-primary transition hover:bg-primary/5"
            href={mapsAction.href}
            {...getExternalLinkProps(mapsAction)}
          >
            📍 Get Directions
          </a>
        ) : null}
        <ShareFacilityButton facility={facility} />
      </div>

      {secondaryPhones.length > 0 ? (
        <div className="mt-3">
          <button
            className="text-sm font-semibold text-primary"
            onClick={() => setShowMoreNumbers((current) => !current)}
            type="button"
          >
            {showMoreNumbers ? "Fewer numbers ↑" : "More numbers ↓"}
          </button>
          {showMoreNumbers ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {secondaryPhones.map((action) => (
                <a
                  className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-strong-border"
                  href={action.href}
                  key={action.id}
                  {...getExternalLinkProps(action)}
                >
                  {action.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {tertiaryActions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {tertiaryActions.map((action) => {
            const Icon = tertiaryIcons[action.kind];

            return (
              <a
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-strong-border"
                href={action.href}
                key={action.id}
                {...getExternalLinkProps(action)}
              >
                {Icon ? <Icon className="size-4 shrink-0" /> : null}
                {getTertiaryLabel(action.kind, action.label)}
              </a>
            );
          })}
        </div>
      ) : null}

      {socialActions.length > 0 ? (
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs text-muted-foreground">Also available on</p>
          <div className="flex flex-wrap gap-2">
            {socialActions.map(({ action, platform }) => {
              const Icon = socialPlatformIcons[platform];
              const platformLabel = capitalize(platform);

              return (
                <a
                  aria-label={platformLabel}
                  className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-strong-border hover:bg-muted"
                  href={action.href}
                  key={action.id}
                  title={platformLabel}
                  {...getExternalLinkProps(action)}
                >
                  <Icon className="size-4 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
