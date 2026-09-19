"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SAVE_INTENT_FIELD, SAVE_INTENT_STAY } from "@/lib/provider/save-intent";
import { showToast } from "@/components/ui/Toaster";

// Placed inside an onboarding step's <form>: when a "Save" (stay on this
// step) finishes, pops the "Draft saved" confirmation where the provider can
// see it. "Save & continue" needs none — moving on is its confirmation.
//
// A failed save comes back as ?save=failed on the same step, so this shows an
// error instead and then clears the flag from the address bar.
export function SaveOutcomeToast() {
  const { pending, data } = useFormStatus();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const wasStaySave = useRef(false);
  const failed = searchParams.get("save") === "failed";

  useEffect(() => {
    if (!failed) return;
    wasStaySave.current = false;
    showToast("Couldn't save — please try again", "error");
    router.replace(pathname, { scroll: false });
  }, [failed, pathname, router]);

  useEffect(() => {
    if (pending) {
      wasStaySave.current = data?.get(SAVE_INTENT_FIELD) === SAVE_INTENT_STAY;
      return;
    }
    if (wasStaySave.current && !failed) {
      wasStaySave.current = false;
      showToast("Draft saved");
    }
  }, [pending, data, failed]);

  return null;
}
