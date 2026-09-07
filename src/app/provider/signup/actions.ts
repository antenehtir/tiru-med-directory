"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  FACILITY_CATEGORY_OTHER_LABEL,
  resolveCategoryChoice,
} from "@/lib/frontend-search-filters";

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
  // The dropdown posts a LABEL. What is stored has to be a category the filter
  // map recognises, or approval refuses the claim later and the provider waits
  // on a queue for a reason nobody told them about. "Medical Complex" is a
  // true description and not a filter bucket, so it stores as Specialty Center
  // and keeps its own wording in facility_type_other, which approval carries
  // through to the listing's subcategory.
  const facilityTypeLabel = formData.get("facility_type") as string;
  const facilityTypeChoice = resolveCategoryChoice(facilityTypeLabel);
  const behavesAs = formData.get("facility_type_behaves_as") as string | null;
  const describedAs = formData.get("facility_type_other") as string;

  const facilityType =
    facilityTypeLabel === FACILITY_CATEGORY_OTHER_LABEL
      ? (behavesAs ?? "")
      : (facilityTypeChoice?.stores ?? facilityTypeLabel);

  const facilityTypeOther =
    facilityTypeLabel === FACILITY_CATEGORY_OTHER_LABEL
      ? describedAs
      : (facilityTypeChoice?.describesAs ?? null);

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

  // The three MANUAL notes that stood here — saying provider_accounts lacked
  // facility_name, claimant_role, facility_phone, facility_type,
  // facility_type_other and diagnostic_subtype — are gone because all six
  // columns exist. Checked against the live database, not against whether
  // migrations 015, 017 and 019 still sit in migrations_draft: a draft file
  // stays on disk after it is run, so its presence says nothing either way.
  // A warning that has stopped being true is worse than no warning, because
  // the next person spends their time re-verifying it.

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
      // Kept whenever the label differed from the stored category, not only
      // for Other: "Medical Complex" stores as Specialty Center and this is
      // the only place its real wording survives to reach the listing.
      facility_type_other: facilityTypeOther || null,
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
