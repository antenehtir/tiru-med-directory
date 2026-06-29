"use client";

import { useState, useTransition } from "react";
import { autoSaveStep4, saveStep4AndContinue } from "@/app/provider/onboarding/doctors/actions";
import {
  DOCTOR_TITLES,
  DOCTOR_ROLES,
  DOCTOR_LANGUAGES,
  DOCTOR_AVAILABLE_DAYS,
  CLINICAL_ROLES_WITH_SPECIALTY,
  createEmptyDoctor,
  type DoctorEntry,
} from "@/lib/provider/doctor-types";

type Claim = Record<string, unknown>;

const BIO_MAX_LENGTH = 300;
const clinicalRoles = CLINICAL_ROLES_WITH_SPECIALTY as readonly string[];

export function Step4DoctorsForm({ claim }: { claim: Claim }) {
  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const existingDoctors = claim.proposed_doctors as DoctorEntry[] | null;
  const [doctors, setDoctors] = useState<DoctorEntry[]>(
    existingDoctors && existingDoctors.length > 0 ? existingDoctors : [createEmptyDoctor()],
  );

  function autoSave(next: DoctorEntry[]) {
    startTransition(async () => {
      await autoSaveStep4(next);
      setLastSaved(new Date());
    });
  }

  function updateDoctor(id: string, partial: Partial<DoctorEntry>) {
    const next = doctors.map((d) => (d.id === id ? { ...d, ...partial } : d));
    setDoctors(next);
    return next;
  }

  function addDoctor() {
    const next = [...doctors, createEmptyDoctor()];
    setDoctors(next);
    autoSave(next);
  }

  function removeDoctor(id: string) {
    const next = doctors.filter((d) => d.id !== id);
    setDoctors(next);
    autoSave(next);
  }

  function toggleListValue(id: string, field: "languages" | "available_days", value: string) {
    const doctor = doctors.find((d) => d.id === id);
    if (!doctor) return;
    const current = doctor[field];
    const nextValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    autoSave(updateDoctor(id, { [field]: nextValues } as Partial<DoctorEntry>));
  }

  function handleRoleChange(id: string, role: string) {
    const partial: Partial<DoctorEntry> = { role };
    if (role !== "Other") partial.role_other = "";
    if (!clinicalRoles.includes(role)) partial.specialty = "";
    autoSave(updateDoctor(id, partial));
  }

  function handleSaveAndContinue() {
    startTransition(async () => {
      await saveStep4AndContinue(doctors);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        This step is optional. You can skip it and still submit your listing.
      </div>
      <a className="inline-block text-sm text-primary hover:underline" href="/provider/onboarding/media">
        Skip this step →
      </a>

      {doctors.map((doctor, index) => {
        const showSpecialty = clinicalRoles.includes(doctor.role);
        const showRoleOther = doctor.role === "Other";
        const bioLength = doctor.bio.length;

        return (
          <div key={doctor.id} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">
                Doctor / Staff #{index + 1}
              </h2>
              {doctors.length > 1 && (
                <button
                  className="shrink-0 text-xs text-red-500 hover:text-red-600"
                  onClick={() => removeDoctor(doctor.id)}
                  type="button"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Full name *</label>
                <input
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={doctor.full_name}
                  onBlur={(e) => autoSave(updateDoctor(doctor.id, { full_name: e.target.value }))}
                  placeholder="e.g. Abebe Kebede"
                  type="text"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">Title</label>
                  <select
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) => autoSave(updateDoctor(doctor.id, { title: e.target.value }))}
                    value={doctor.title}
                  >
                    <option value="">Select…</option>
                    {DOCTOR_TITLES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">Role</label>
                  <select
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) => handleRoleChange(doctor.id, e.target.value)}
                    value={doctor.role}
                  >
                    <option value="">Select…</option>
                    {DOCTOR_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {showRoleOther && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">Specify role</label>
                  <input
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={doctor.role_other}
                    onBlur={(e) => autoSave(updateDoctor(doctor.id, { role_other: e.target.value }))}
                    placeholder="e.g. Anesthesiologist"
                    type="text"
                  />
                </div>
              )}

              {showSpecialty && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">Specialty</label>
                  <input
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={doctor.specialty}
                    onBlur={(e) => autoSave(updateDoctor(doctor.id, { specialty: e.target.value }))}
                    placeholder="e.g. Cardiology"
                    type="text"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">Languages spoken</p>
                <div className="flex flex-wrap gap-2">
                  {DOCTOR_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        doctor.languages.includes(lang)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
                      }`}
                      onClick={() => toggleListValue(doctor.id, "languages", lang)}
                      type="button"
                    >
                      {doctor.languages.includes(lang) ? "✓ " : ""}
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">Available days</p>
                <div className="flex flex-wrap gap-2">
                  {DOCTOR_AVAILABLE_DAYS.map((day) => (
                    <button
                      key={day}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        doctor.available_days.includes(day)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
                      }`}
                      onClick={() => toggleListValue(doctor.id, "available_days", day)}
                      type="button"
                    >
                      {doctor.available_days.includes(day) ? "✓ " : ""}
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Available hours</label>
                <input
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={doctor.available_hours}
                  onBlur={(e) => autoSave(updateDoctor(doctor.id, { available_hours: e.target.value }))}
                  placeholder="e.g. 9am–5pm"
                  type="text"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">Appointment required?</p>
                <div className="flex gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      checked={!doctor.appointment_required}
                      name={`appointment_required_${doctor.id}`}
                      onChange={() => autoSave(updateDoctor(doctor.id, { appointment_required: false }))}
                      type="radio"
                    />
                    No — walk-in OK
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      checked={doctor.appointment_required}
                      name={`appointment_required_${doctor.id}`}
                      onChange={() => autoSave(updateDoctor(doctor.id, { appointment_required: true }))}
                      type="radio"
                    />
                    Yes
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Short bio (optional)</label>
                <textarea
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  onBlur={(e) => autoSave(updateDoctor(doctor.id, { bio: e.target.value }))}
                  onChange={(e) => updateDoctor(doctor.id, { bio: e.target.value })}
                  placeholder="A short professional summary…"
                  rows={3}
                  value={doctor.bio}
                />
                <p
                  className={`text-right text-xs ${
                    bioLength > BIO_MAX_LENGTH ? "text-red-500" : "text-muted-foreground"
                  }`}
                >
                  {bioLength} / {BIO_MAX_LENGTH}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      <button
        className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
        onClick={addDoctor}
        type="button"
      >
        + Add another doctor
      </button>

      <div className="flex items-center justify-between">
        <a className="text-sm text-muted-foreground hover:text-foreground" href="/provider/onboarding/services">
          ← Back
        </a>
        <div className="flex items-center gap-3">
          {isPending && <span className="text-xs text-muted-foreground">Saving…</span>}
          {!isPending && lastSaved && (
            <span className="text-xs text-muted-foreground">
              Draft saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            onClick={handleSaveAndContinue}
            type="button"
          >
            Save & continue →
          </button>
        </div>
      </div>
    </div>
  );
}
