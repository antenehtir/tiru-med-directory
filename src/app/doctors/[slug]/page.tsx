import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageShell } from "@/components/layout/PageShell";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import {
  createPublicContactActions,
  getExternalLinkProps,
} from "@/lib/contact-actions";
import {
  getSupabasePublicDoctorDetailBySlug,
  type DoctorPublicDetailReadResult,
} from "@/lib/supabase/doctors-public-read";
import {
  getSupabasePublicProviderContactChannels,
  type PublicProviderContactChannel,
} from "@/lib/supabase/provider-contact-channels-public-read";
import type { PublicProviderDetail } from "@/types/public-listings";

export const dynamic = "force-dynamic";

type DoctorDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

type DoctorContactChannelType =
  | "phone"
  | "whatsapp"
  | "website"
  | "maps"
  | "social"
  | "appointment";

type DoctorContactChannel = {
  id: string;
  channelType: DoctorContactChannelType;
  label: string;
  value: string;
  href?: string;
};

export async function generateMetadata({
  params,
}: DoctorDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getSafeDoctorDetail(slug);
  const doctor = result.status === "success" ? result.detail : null;

  return {
    title: doctor ? `${doctor.name} — Tiru` : "Specialist — Tiru",
    description: doctor ? `${doctor.categoryLabel} in Addis Ababa.` : "",
  };
}

export default async function DoctorDetailRoute({
  params,
}: DoctorDetailRouteProps) {
  const { slug } = await params;
  const [result, contactChannels] = await Promise.all([
    getSafeDoctorDetail(slug),
    getSafeDoctorContactChannels(slug),
  ]);

  if (result.status !== "success") {
    notFound();
  }

  return (
    <PageShell>
      <DoctorPublicDetailPage
        contactChannels={contactChannels}
        doctor={result.detail}
      />
    </PageShell>
  );
}

async function getSafeDoctorDetail(
  slug: string,
): Promise<DoctorPublicDetailReadResult> {
  try {
    return await getSupabasePublicDoctorDetailBySlug(slug);
  } catch {
    return {
      status: "error",
      source: "static-fallback",
      detail: null,
      fallbackRecommended: true,
      reason: "query-failed",
      errorCode: "DOCTORS_PUBLIC_READ_FAILED",
      message: "Specialist detail public read failed.",
    };
  }
}

async function getSafeDoctorContactChannels(
  slug: string,
): Promise<DoctorContactChannel[]> {
  try {
    const result = await getSupabasePublicProviderContactChannels(
      "doctor",
      slug,
    );

    if (result.status !== "success") {
      return [];
    }

    return result.channels
      .map(mapPublicProviderContactChannelToDoctorContactChannel)
      .filter((channel): channel is DoctorContactChannel =>
        Boolean(channel),
      );
  } catch {
    return [];
  }
}

function DoctorPublicDetailPage({
  contactChannels,
  doctor,
}: {
  contactChannels: DoctorContactChannel[];
  doctor: PublicProviderDetail;
}) {
  const primaryAffiliation = doctor.affiliations[0] ?? "Facility not listed";
  const specialtySummary =
    doctor.specialties.length > 0
      ? doctor.specialties.join(", ")
      : doctor.categoryLabel;
  const locationLine = doctor.address
    ? `${doctor.address}, ${doctor.location.displayName}`
    : doctor.location.displayName;

  return (
    <PageContainer className="py-8 sm:py-10">
      <div className="space-y-8">
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-xl font-semibold text-primary">
                {getInitials(doctor.name)}
              </div>
              <div className="min-w-0 space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">
                    Specialist detail
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {doctor.name}
                  </h1>
                  <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                    {specialtySummary} at {primaryAffiliation}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full border border-border bg-muted px-3 py-1 font-medium text-primary">
                    {doctor.categoryLabel}
                  </span>
                  <span className="rounded-full border border-border bg-background px-3 py-1 font-medium text-muted-foreground">
                    {doctor.location.displayName}
                  </span>
                </div>
              </div>
            </div>
            <VerificationBadge
              status={doctor.verification.status}
              entityType="doctor"
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Specialty" value={specialtySummary} />
          <SummaryCard label="Location" value={doctor.location.displayName} />
          <SummaryCard
            label="Availability"
            value={doctor.availabilityPreview ?? doctor.workingHours}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <InfoPanel title="Public Profile">
              <p className="leading-7 text-muted-foreground">
                {doctor.description}
              </p>
              <DetailList
                items={[
                  ["Specialties", specialtySummary],
                  ["Affiliation", primaryAffiliation],
                  ["Location", locationLine],
                  ["Profile status", doctor.verification.label],
                ]}
              />
            </InfoPanel>

            <InfoPanel title="Availability">
              <DetailList
                items={[
                  ["Schedule", doctor.workingHours],
                  [
                    "Visit modes",
                    doctor.availabilityPreview ??
                      "Visit modes are being verified.",
                  ],
                  [
                    "Telemedicine",
                    doctor.telemedicinePreview ??
                      "Telemedicine availability not listed",
                  ],
                ]}
              />
            </InfoPanel>
          </div>

          <aside className="space-y-6">
            <InfoPanel title="Trust Status">
              <div className="space-y-3">
                <VerificationBadge
                  status={doctor.verification.status}
                  entityType="doctor"
                />
                <p className="text-sm leading-6 text-muted-foreground">
                  {doctor.verification.note}
                </p>
              </div>
            </InfoPanel>

            <InfoPanel title="Actions">
              <div className="space-y-3">
                <Link
                  href="/doctors"
                  className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Back to specialists
                </Link>
                <Link
                  href={doctor.correctionHref}
                  className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Suggest a correction
                </Link>
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Public profile only. Booking, messaging, and account features
                are not active from this page.
              </p>
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
                        className="rounded-md border border-border bg-background p-3 text-sm leading-6"
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
                              className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-semibold text-primary"
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
            </InfoPanel>
          </aside>
        </section>
      </div>
    </PageContainer>
  );
}

function mapPublicProviderContactChannelToDoctorContactChannel(
  channel: PublicProviderContactChannel,
): DoctorContactChannel | null {
  if (!isAllowedDoctorContactChannelType(channel.channelType)) {
    return null;
  }

  return {
    id: channel.id,
    channelType: channel.channelType,
    label: channel.label,
    value: channel.valuePublic,
    href: channel.urlPublic,
  };
}

function isAllowedDoctorContactChannelType(
  channelType: PublicProviderContactChannel["channelType"],
): channelType is DoctorContactChannel["channelType"] {
  return (
    channelType === "phone" ||
    channelType === "whatsapp" ||
    channelType === "website" ||
    channelType === "maps" ||
    channelType === "social" ||
    channelType === "appointment"
  );
}

function getChannelTypeLabel(channel: DoctorContactChannel): string {
  if (channel.channelType === "social" && channel.label === "LinkedIn") {
    return "LinkedIn";
  }

  if (channel.channelType === "maps") {
    return "Maps";
  }

  if (channel.channelType === "whatsapp") {
    return "WhatsApp";
  }

  return channel.channelType;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailList({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="mt-5 divide-y divide-border">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="grid gap-1 py-3 text-sm sm:grid-cols-[160px_minmax(0,1fr)]"
        >
          <dt className="font-medium text-muted-foreground">
            {label}
          </dt>
          <dd className="text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function getInitials(name: string) {
  const words = name
    .replace(/^dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
