"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  FACILITY_CATEGORY_OTHER_LABEL,
  resolveCategoryChoice,
} from "@/lib/frontend-search-filters";
import { loadClaimableFacility, recordClaim } from "@/lib/provider/claim-facility";

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

  // Straight to verification and the wizard. This used to go to the "is your
  // facility already on Tiru?" search first — but that question is now asked
  // before sign-up (/provider/signup with no parameters), so anyone reaching
  // this form has already said their facility is not listed.
  redirect("/provider/onboarding/verify");
}

// Sign-up for claiming a facility Tiru already lists. One form: the account,
// the claimant's role and phone — and the claim is submitted in the same
// step. No facility details are asked for; the live listing already has
// them, and after verification the claimant edits it directly.
export async function providerClaimSignUp(formData: FormData) {
  const facilityId = String(formData.get("claim_facility_id") ?? "");
  const back = `/provider/signup?claim=${encodeURIComponent(facilityId)}`;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const roleRaw = String(formData.get("claimant_role") ?? "");
  const roleOther = String(formData.get("claimant_role_other") ?? "").trim();

  if (formData.get("terms") !== "on") redirect(`${back}&error=terms`);

  const supabase = await createSignupClient();

  // Checked before the account is created, so nobody ends up with an account
  // attached to a facility they could never have claimed.
  const claimable = await loadClaimableFacility(supabase, facilityId);
  if (!claimable.ok) redirect(`${back}&error=${claimable.reason}`);
  const facility = claimable.facility;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) {
    redirect(`${back}&error=${encodeURIComponent(error?.message ?? "signup_failed")}`);
  }

  const { error: insertError } = await supabase.from("provider_accounts").insert({
    id: data.user.id,
    email,
    display_name: displayName,
    phone,
    claimant_role: roleRaw,
    claimant_role_other: roleRaw === "Other" ? roleOther : null,
    claimant_phone: phone,
    // The facility is chosen here, not owned: nothing grants edit access
    // until an admin approves the claim.
    facility_id: facility.id,
    facility_name: facility.name,
    facility_type: facility.category,
    verification_status_internal: "call_pending",
    terms_accepted: true,
    terms_accepted_at: new Date().toISOString(),
    onboarding_phase: 0,
    completion_pct: 0,
    last_active_at: new Date().toISOString(),
  });
  if (insertError) {
    console.error("providerClaimSignUp: provider_accounts insert failed:", insertError.message);
    redirect(`${back}&error=account_creation_failed`);
  }

  // If this fails the account still exists; /provider/claim shows the claim
  // form again rather than a dead end, so the claimant can resubmit.
  const { error: claimError } = await recordClaim(
    supabase,
    data.user.id,
    facility.id,
    "pending_review",
    facility.category,
  );
  if (claimError) console.error("providerClaimSignUp: claim write failed:", claimError);

  redirect("/provider/claim");
}

async function createSignupClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
}
