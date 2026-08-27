"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function providerSignUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("display_name") as string;
  const facilityName = formData.get("facility_name") as string;
  const phone = formData.get("phone") as string;
  const facilityPhone = formData.get("facility_phone") as string;
  const claimantRoleRaw = formData.get("claimant_role") as string;
  const claimantRoleOther = formData.get("claimant_role_other") as string;
  const claimantRole = claimantRoleRaw === "Other" ? claimantRoleOther : claimantRoleRaw;
  const facilityType = formData.get("facility_type") as string;
  const facilityTypeOther = formData.get("facility_type_other") as string;
  const diagnosticSubtype =
    facilityType === "Diagnostic Center"
      ? (formData.get("diagnostic_subtype") as string)
      : null;
  const termsAccepted = formData.get("terms") === "on";

  if (!termsAccepted) {
    redirect("/provider/signup?error=terms");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(`/provider/signup?error=${encodeURIComponent(error?.message ?? "signup_failed")}`);
  }

  // MANUAL: provider_accounts has no facility_name column yet — run this
  // against the live Supabase project (SQL Editor) before this write below
  // will persist it. See also supabase/migrations_draft/015_provider_accounts_facility_name.sql
  // -- MANUAL: ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS facility_name text;

  // MANUAL: provider_accounts has no claimant_role or facility_phone columns
  // yet — run this against the live Supabase project (SQL Editor) before
  // this write below will persist them. See also
  // supabase/migrations_draft/017_provider_accounts_role_and_facility_phone.sql
  // -- MANUAL: ALTER TABLE provider_accounts ADD COLUMN IF NOT EXISTS claimant_role text, ADD COLUMN IF NOT EXISTS facility_phone text;

  // MANUAL: provider_accounts has no facility_type, facility_type_other, or
  // diagnostic_subtype columns yet. See
  // supabase/migrations_draft/019_provider_category_fields.sql

  // Create provider_account record
  const { error: insertError } = await supabase
    .from("provider_accounts")
    .insert({
      id: data.user.id,
      email,
      display_name: displayName,
      facility_name: facilityName,
      phone,
      facility_phone: facilityPhone,
      claimant_role: claimantRole,
      facility_type: facilityType,
      facility_type_other: facilityType === "Other" ? facilityTypeOther : null,
      diagnostic_subtype: diagnosticSubtype,
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString(),
      onboarding_phase: 0,
      completion_pct: 10,
      last_active_at: new Date().toISOString(),
    });

  if (insertError) {
    redirect(`/provider/signup?error=account_creation_failed`);
  }

  redirect("/provider/onboarding/claim");
}
