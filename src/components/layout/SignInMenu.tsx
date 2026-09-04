"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type SVGProps } from "react";

type RoleOption = {
  key: string;
  label: string;
  description: string;
  href?: string;
  disabled: boolean;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    key: "provider",
    label: "Healthcare Provider",
    description: "Manage your facility listing",
    href: "/provider/login",
    disabled: false,
  },
  {
    key: "specialist",
    label: "Specialist",
    description: "For individual doctors",
    disabled: true,
  },
  {
    key: "patient",
    label: "Patient / User",
    description: "For patients and families",
    disabled: true,
  },
];

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    />
  );
}

function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </Icon>
  );
}

function ProviderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 21v-4h6v4M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01" />
    </Icon>
  );
}

function SpecialistIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 3v6a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
      <path d="M6 3H4M18 3h2M18 15a4 4 0 0 1-4 4h-4" />
      <circle cx="18" cy="19" r="2" />
    </Icon>
  );
}

function PatientIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      <path d="M12 20v-3m-2-2h4" />
    </Icon>
  );
}

const roleIcons: Record<string, (props: SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  provider: ProviderIcon,
  specialist: SpecialistIcon,
  patient: PatientIcon,
};

export function SignInMenu({ compact = false }: { compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={compact ? "Sign in" : undefined}
        className={
          compact
            ? "flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 min-[380px]:size-10"
            : "ml-2 hidden min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 xl:inline-flex"
        }
      >
        <UserIcon className="size-4 shrink-0" />
        {!compact && "Sign in"}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sign in as
          </p>
          <div className="py-1">
            {ROLE_OPTIONS.map((role) => {
              const RoleIcon = roleIcons[role.key];

              if (role.disabled) {
                return (
                  <div
                    key={role.key}
                    className="flex cursor-not-allowed items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground/60"
                  >
                    <RoleIcon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium leading-tight">{role.label}</span>
                      <span className="block truncate text-xs">{role.description}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      Coming soon
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={role.key}
                  href={role.href!}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <RoleIcon className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-tight">{role.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
