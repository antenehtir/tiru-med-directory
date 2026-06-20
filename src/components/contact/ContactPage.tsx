import Link from "next/link";
import type { SVGProps } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { WHATSAPP_HREF } from "@/lib/whatsapp";

function BuildingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 21V8a1 1 0 011-1h4V4a1 1 0 011-1h4a1 1 0 011 1v3h4a1 1 0 011 1v13" />
      <path d="M4 21h16" />
      <path d="M9 21v-3h6v3" />
      <path d="M10 8h.01M14 8h.01M10 12h.01M14 12h.01" />
    </svg>
  );
}

function EditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

type TriageCard = {
  Icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  title: string;
  description: string;
  href: string;
  isExternal?: boolean;
};

const triageCards: TriageCard[] = [
  {
    Icon: BuildingIcon,
    title: "List your practice on Tiru",
    description:
      "Add your facility, specialist practice, or service to the directory.",
    href: "/register",
  },
  {
    Icon: EditIcon,
    title: "Something's outdated",
    description: "Help us keep listings accurate with a quick correction.",
    href: "/corrections",
  },
  {
    Icon: ChatIcon,
    title: "Other questions",
    description: "Message us directly on WhatsApp for anything else.",
    href: WHATSAPP_HREF,
    isExternal: true,
  },
];

export function ContactPage() {
  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          How can we help?
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Choose what you need &mdash; we&apos;ll route you to the right place.
        </p>

        <div className="mt-6 grid gap-3">
          {triageCards.map(({ Icon, title, description, href, isExternal }) => (
            <Link
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-strong-border hover:shadow-md"
              href={href}
              key={title}
              {...(isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-foreground">
                  {title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {description}
                </span>
              </span>
              <ChevronRightIcon className="mt-1 size-5 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          For medical emergencies, contact local emergency services or go to
          the nearest hospital directly. This platform is not an emergency
          channel.
        </p>
      </div>
    </PageContainer>
  );
}
