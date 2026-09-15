// The three form-based onboarding steps (identity, location, services) post
// their FormData to one server action, and that action has always finished by
// redirecting to the next step. Splitting "Save" out from "Save & continue"
// needs those two to reach the same action and part ways at the end, rather
// than duplicating the whole save into a second action that would then have
// to be kept in step with the first one forever.
//
// A submitting button contributes its own name/value pair to the FormData,
// and only the button actually pressed does — so the presence of this field
// IS the signal. The primary button sends nothing and redirects exactly as
// before, which is also what every existing caller does.
export const SAVE_INTENT_FIELD = "save_intent";
export const SAVE_INTENT_STAY = "stay";
// The primary button declares itself too, even though "not stay" is already
// the default. Both buttons in a form see useFormStatus().pending, so each
// needs its own name/value to tell whether IT was the one pressed — without
// this the spinner appears on both at once.
export const SAVE_INTENT_CONTINUE = "continue";

export function wantsToStayOnStep(formData: FormData): boolean {
  return formData.get(SAVE_INTENT_FIELD) === SAVE_INTENT_STAY;
}
