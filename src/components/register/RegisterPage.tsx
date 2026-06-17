"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type ProviderType =
  | "Specialist"
  | "Healthcare Facility"
  | "Diagnostic Center"
  | "Pharmacy"
  | "Ambulance Service"
  | "Other";

type FacilityEntry = {
  id: string;
  searchFacility: string;
  manualFacility: string;
  days: string[];
  startTime: string;
  endTime: string;
};

type BranchEntry = {
  id: string;
  name: string;
  address: string;
  subCity: string;
  phone: string;
  googleMapsUrl: string;
};

type FormState = {
  name: string;
  phone: string;
  email: string;

  specialty: string;
  specialtyOther: string;
  subSpecialty: string;
  multipleFacilities: boolean;
  facilityEntries: FacilityEntry[];
  telemedicineAvailable: boolean;
  telemedicineDetails: string;
  bookingLink: string;
  linkedin: string;

  category: string;
  categoryOther: string;
  majorServices: string;
  specialtiesAvailable: string;
  hasBranches: boolean;
  branches: BranchEntry[];
  opdHours: string;
  hasEmergency: boolean;
  emergencyType: string;
  emergencyHours: string;
  subCity: string;
  address: string;
  website: string;
  telegram: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  googleMapsUrl: string;

  testTypes: string;
  sampleCollectionAvailable: boolean;
  homeSampleCollection: boolean;

  pharmacyServices: string;
  deliveryAvailable: boolean;

  ambulanceCoverageArea: string;
  ambulanceFleetSize: string;
  ambulanceAvailable247: boolean;
  ambulanceAvailableHours: string;
  ambulanceServiceTypes: string[];
  ambulanceEquipment: string;
  ambulanceResponseTime: string;
  ambulanceBaseLocation: string;

  otherDescription: string;

  submitterName: string;
  submitterRole: string;
  submitterContact: string;
};

type Updater = <K extends keyof FormState>(key: K, value: FormState[K]) => void;
type SubmitState = "idle" | "submitting" | "success" | "error";

const PROVIDER_TYPE_OPTIONS: { value: ProviderType; label: string }[] = [
  { value: "Specialist", label: "Specialist" },
  { value: "Healthcare Facility", label: "Healthcare Facility" },
  { value: "Diagnostic Center", label: "Diagnostic Center (Lab / Imaging)" },
  { value: "Pharmacy", label: "Pharmacy" },
  { value: "Ambulance Service", label: "Ambulance Service" },
  { value: "Other", label: "Other (Telemedicine, Home Care, etc.)" },
];

const SPECIALTY_OPTIONS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology & Obstetrics",
  "Dermatology",
  "Ophthalmology",
  "ENT",
  "Psychiatry",
  "Internal Medicine",
  "General Surgery",
  "Urology",
  "Oncology",
  "Radiology",
  "Anesthesiology",
  "Dentistry",
  "Physical Therapy",
  "Other",
];

const FACILITY_CATEGORY_OPTIONS = [
  "General Hospital",
  "Specialty Center",
  "Clinic",
  "Diagnostic Center",
  "Pharmacy",
  "Home Care",
  "Telemedicine",
  "Ambulance Service",
  "Medical Plaza",
  "Other",
];

const AMBULANCE_SERVICE_TYPES = [
  "Emergency response",
  "Patient transfer",
  "Neonatal transport",
  "ICU transport",
  "Other",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function createFacilityEntry(id: string): FacilityEntry {
  return { id, searchFacility: "", manualFacility: "", days: [], startTime: "", endTime: "" };
}

function createBranchEntry(id: string): BranchEntry {
  return { id, name: "", address: "", subCity: "", phone: "", googleMapsUrl: "" };
}

function createInitialState(name: string): FormState {
  return {
    name,
    phone: "",
    email: "",
    specialty: "",
    specialtyOther: "",
    subSpecialty: "",
    multipleFacilities: false,
    facilityEntries: [createFacilityEntry("facility-entry-0")],
    telemedicineAvailable: false,
    telemedicineDetails: "",
    bookingLink: "",
    linkedin: "",
    category: "",
    categoryOther: "",
    majorServices: "",
    specialtiesAvailable: "",
    hasBranches: false,
    branches: [],
    opdHours: "",
    hasEmergency: false,
    emergencyType: "",
    emergencyHours: "",
    subCity: "",
    address: "",
    website: "",
    telegram: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    googleMapsUrl: "",
    testTypes: "",
    sampleCollectionAvailable: false,
    homeSampleCollection: false,
    pharmacyServices: "",
    deliveryAvailable: false,
    ambulanceCoverageArea: "",
    ambulanceFleetSize: "",
    ambulanceAvailable247: true,
    ambulanceAvailableHours: "",
    ambulanceServiceTypes: [],
    ambulanceEquipment: "",
    ambulanceResponseTime: "",
    ambulanceBaseLocation: "",
    otherDescription: "",
    submitterName: "",
    submitterRole: "",
    submitterContact: "",
  };
}

const inputBaseClassName =
  "w-full min-h-12 rounded-xl border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelClassName = "text-sm font-semibold text-foreground mb-1 block";
const privateNoteClassName = "text-xs text-amber-600 mt-1";
const phoneHintClassName = "mt-1 text-xs text-muted-foreground";
const errorClassName = "text-xs text-red-500 mt-1";
const toggleBaseClassName = "px-4 py-2 rounded-full text-sm font-medium border";
const toggleActiveClassName = "bg-primary text-primary-foreground border-primary";
const toggleInactiveClassName = "border-border bg-card text-foreground";

function fieldClassName(hasError: boolean) {
  return `${inputBaseClassName} ${hasError ? "border-red-500" : "border-border"}`;
}

function YesNoToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      <button
        className={`${toggleBaseClassName} ${value ? toggleActiveClassName : toggleInactiveClassName}`}
        onClick={() => onChange(true)}
        type="button"
      >
        Yes
      </button>
      <button
        className={`${toggleBaseClassName} ${!value ? toggleActiveClassName : toggleInactiveClassName}`}
        onClick={() => onChange(false)}
        type="button"
      >
        No
      </button>
    </div>
  );
}

function DayPills({ days, onToggle }: { days: string[]; onToggle: (day: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((day) => {
        const active = days.includes(day);
        return (
          <button
            className={`${toggleBaseClassName} ${active ? toggleActiveClassName : toggleInactiveClassName}`}
            key={day}
            onClick={() => onToggle(day)}
            type="button"
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}

type BranchSectionProps = {
  branches: BranchEntry[];
  updateBranch: (id: string, patch: Partial<BranchEntry>) => void;
  addBranch: () => void;
  removeBranch: (id: string) => void;
};

function BranchSection({ branches, updateBranch, addBranch, removeBranch }: BranchSectionProps) {
  return (
    <div className="mt-3 grid gap-4">
      {branches.map((branch, index) => (
        <div className="rounded-xl border border-border p-4" key={branch.id}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Branch {index + 1}</p>
            <button
              className="text-xs font-semibold text-muted-foreground underline"
              onClick={() => removeBranch(branch.id)}
              type="button"
            >
              Remove
            </button>
          </div>
          <div className="mt-3 grid gap-3">
            <input
              className={fieldClassName(false)}
              onChange={(e) => updateBranch(branch.id, { name: e.target.value })}
              placeholder="Branch name"
              type="text"
              value={branch.name}
            />
            <input
              className={fieldClassName(false)}
              onChange={(e) => updateBranch(branch.id, { address: e.target.value })}
              placeholder="Address"
              type="text"
              value={branch.address}
            />
            <input
              className={fieldClassName(false)}
              onChange={(e) => updateBranch(branch.id, { subCity: e.target.value })}
              placeholder="Sub-city / Area"
              type="text"
              value={branch.subCity}
            />
            <div>
              <input
                className={fieldClassName(false)}
                onChange={(e) => updateBranch(branch.id, { phone: e.target.value })}
                placeholder="Phone"
                type="tel"
                value={branch.phone}
              />
              <p className={phoneHintClassName}>Separate multiple numbers with /</p>
            </div>
            <div>
              <label className={labelClassName} htmlFor={`branch-maps-${branch.id}`}>
                Google Maps link for this branch
              </label>
              <input
                className={fieldClassName(false)}
                id={`branch-maps-${branch.id}`}
                onChange={(e) => updateBranch(branch.id, { googleMapsUrl: e.target.value })}
                type="url"
                value={branch.googleMapsUrl}
              />
            </div>
          </div>
        </div>
      ))}
      <button className="text-sm font-semibold text-primary" onClick={addBranch} type="button">
        + Add branch
      </button>
    </div>
  );
}

function SocialMediaFields({ form, update }: { form: FormState; update: Updater }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-muted-foreground">Social media (optional)</p>
      <div className="grid gap-4">
        <div>
          <label className={labelClassName} htmlFor="facebook">
            Facebook
          </label>
          <input
            className={fieldClassName(false)}
            id="facebook"
            onChange={(e) => update("facebook", e.target.value)}
            placeholder="https://facebook.com/yourpage"
            type="url"
            value={form.facebook}
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="instagram">
            Instagram
          </label>
          <input
            className={fieldClassName(false)}
            id="instagram"
            onChange={(e) => update("instagram", e.target.value)}
            placeholder="https://instagram.com/yourpage"
            type="url"
            value={form.instagram}
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="tiktok">
            TikTok
          </label>
          <input
            className={fieldClassName(false)}
            id="tiktok"
            onChange={(e) => update("tiktok", e.target.value)}
            placeholder="https://tiktok.com/@yourpage"
            type="url"
            value={form.tiktok}
          />
        </div>
      </div>
    </div>
  );
}

type SpecialistFieldsProps = {
  form: FormState;
  errors: Record<string, string>;
  update: Updater;
  toggleFacilityDay: (id: string, day: string) => void;
  updateFacilityEntry: (id: string, patch: Partial<FacilityEntry>) => void;
  addFacilityEntry: () => void;
  removeFacilityEntry: (id: string) => void;
};

function SpecialistFields({
  form,
  errors,
  update,
  toggleFacilityDay,
  updateFacilityEntry,
  addFacilityEntry,
  removeFacilityEntry,
}: SpecialistFieldsProps) {
  return (
    <>
      <div>
        <label className={labelClassName} htmlFor="specialty">
          Specialty <span className="text-error">*</span>
        </label>
        <select
          className={fieldClassName(Boolean(errors.specialty))}
          id="specialty"
          onChange={(e) => update("specialty", e.target.value)}
          value={form.specialty}
        >
          <option disabled value="">
            Select a specialty
          </option>
          {SPECIALTY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.specialty ? <p className={errorClassName}>{errors.specialty}</p> : null}
        {form.specialty === "Other" ? (
          <div className="mt-2">
            <input
              className={fieldClassName(Boolean(errors.specialtyOther))}
              onChange={(e) => update("specialtyOther", e.target.value)}
              placeholder="Enter specialty"
              type="text"
              value={form.specialtyOther}
            />
            {errors.specialtyOther ? (
              <p className={errorClassName}>{errors.specialtyOther}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div>
        <label className={labelClassName} htmlFor="subSpecialty">
          Sub-specialty
        </label>
        <input
          className={fieldClassName(false)}
          id="subSpecialty"
          onChange={(e) => update("subSpecialty", e.target.value)}
          placeholder="e.g. Pediatric Cardiology"
          type="text"
          value={form.subSpecialty}
        />
      </div>

      <div>
        <label className={labelClassName}>Practice at multiple facilities?</label>
        <YesNoToggle onChange={(v) => update("multipleFacilities", v)} value={form.multipleFacilities} />
      </div>

      <div className="grid gap-4">
        <label className={labelClassName}>
          Where do you practice? <span className="text-error">*</span>
        </label>
        {errors.facilities ? <p className={errorClassName}>{errors.facilities}</p> : null}

        {form.facilityEntries.map((entry, index) => (
          <div className="rounded-xl border border-border p-4" key={entry.id}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Practice location {index + 1}</p>
              {index > 0 ? (
                <button
                  className="text-xs font-semibold text-muted-foreground underline"
                  onClick={() => removeFacilityEntry(entry.id)}
                  type="button"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <div className="mt-3">
              <label className={labelClassName} htmlFor={`search-facility-${entry.id}`}>
                Search existing Tiru facilities
              </label>
              <input
                className={fieldClassName(false)}
                id={`search-facility-${entry.id}`}
                onChange={(e) => updateFacilityEntry(entry.id, { searchFacility: e.target.value })}
                placeholder="Type facility name on Tiru"
                type="text"
                value={entry.searchFacility}
              />
            </div>

            <div className="mt-3">
              <label className={labelClassName} htmlFor={`manual-facility-${entry.id}`}>
                Or enter name manually
              </label>
              <input
                className={fieldClassName(false)}
                id={`manual-facility-${entry.id}`}
                onChange={(e) => updateFacilityEntry(entry.id, { manualFacility: e.target.value })}
                placeholder="If not yet on Tiru"
                type="text"
                value={entry.manualFacility}
              />
            </div>

            <div className="mt-3">
              <label className={labelClassName}>
                Consultation days <span className="text-error">*</span>
              </label>
              <DayPills days={entry.days} onToggle={(day) => toggleFacilityDay(entry.id, day)} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName} htmlFor={`start-time-${entry.id}`}>
                  Start time
                </label>
                <input
                  className={fieldClassName(false)}
                  id={`start-time-${entry.id}`}
                  onChange={(e) => updateFacilityEntry(entry.id, { startTime: e.target.value })}
                  type="time"
                  value={entry.startTime}
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor={`end-time-${entry.id}`}>
                  End time
                </label>
                <input
                  className={fieldClassName(false)}
                  id={`end-time-${entry.id}`}
                  onChange={(e) => updateFacilityEntry(entry.id, { endTime: e.target.value })}
                  type="time"
                  value={entry.endTime}
                />
              </div>
            </div>
            {errors[`schedule-${entry.id}`] ? (
              <p className={errorClassName}>{errors[`schedule-${entry.id}`]}</p>
            ) : null}
          </div>
        ))}

        {form.multipleFacilities ? (
          <button
            className="text-sm font-semibold text-primary"
            onClick={addFacilityEntry}
            type="button"
          >
            + Add another facility
          </button>
        ) : null}
      </div>

      <div>
        <label className={labelClassName}>Telemedicine available?</label>
        <YesNoToggle
          onChange={(v) => update("telemedicineAvailable", v)}
          value={form.telemedicineAvailable}
        />
        {form.telemedicineAvailable ? (
          <textarea
            className={`${fieldClassName(false)} mt-3 min-h-28 py-2`}
            onChange={(e) => update("telemedicineDetails", e.target.value)}
            placeholder="Telemedicine details (platform, link, notes)"
            rows={4}
            value={form.telemedicineDetails}
          />
        ) : null}
      </div>

      <div>
        <label className={labelClassName} htmlFor="bookingLink">
          Booking link
        </label>
        <input
          className={fieldClassName(false)}
          id="bookingLink"
          onChange={(e) => update("bookingLink", e.target.value)}
          type="url"
          value={form.bookingLink}
        />
      </div>

      <div>
        <label className={labelClassName} htmlFor="phone">
          Phone <span className="text-error">*</span>
        </label>
        <input
          className={fieldClassName(Boolean(errors.phone))}
          id="phone"
          onChange={(e) => update("phone", e.target.value)}
          type="tel"
          value={form.phone}
        />
        {errors.phone ? <p className={errorClassName}>{errors.phone}</p> : null}
        <p className={phoneHintClassName}>Separate multiple numbers with /</p>
        <p className={privateNoteClassName}>⚠ Not visible to public — for Tiru staff only</p>
      </div>

      <div>
        <label className={labelClassName} htmlFor="email">
          Email
        </label>
        <input
          className={fieldClassName(false)}
          id="email"
          onChange={(e) => update("email", e.target.value)}
          type="email"
          value={form.email}
        />
        <p className={privateNoteClassName}>⚠ Not visible to public — for Tiru staff only</p>
      </div>

      <div>
        <label className={labelClassName} htmlFor="linkedin">
          LinkedIn profile
        </label>
        <input
          className={fieldClassName(false)}
          id="linkedin"
          onChange={(e) => update("linkedin", e.target.value)}
          placeholder="https://linkedin.com/in/yourname"
          type="url"
          value={form.linkedin}
        />
        <p className={privateNoteClassName}>⚠ Not visible to public — for Tiru staff only</p>
      </div>
    </>
  );
}

type FacilityLikeFieldsProps = {
  isDiagnostic: boolean;
  form: FormState;
  errors: Record<string, string>;
  update: Updater;
  updateBranch: (id: string, patch: Partial<BranchEntry>) => void;
  addBranch: () => void;
  removeBranch: (id: string) => void;
};

function FacilityLikeFields({
  isDiagnostic,
  form,
  errors,
  update,
  updateBranch,
  addBranch,
  removeBranch,
}: FacilityLikeFieldsProps) {
  return (
    <>
      <div>
        <label className={labelClassName} htmlFor="category">
          Category <span className="text-error">*</span>
        </label>
        <select
          className={fieldClassName(Boolean(errors.category))}
          id="category"
          onChange={(e) => update("category", e.target.value)}
          value={form.category}
        >
          <option disabled value="">
            Select a category
          </option>
          {FACILITY_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.category ? <p className={errorClassName}>{errors.category}</p> : null}
        {form.category === "Other" ? (
          <div className="mt-2">
            <input
              className={fieldClassName(Boolean(errors.categoryOther))}
              onChange={(e) => update("categoryOther", e.target.value)}
              placeholder="Enter category"
              type="text"
              value={form.categoryOther}
            />
            {errors.categoryOther ? (
              <p className={errorClassName}>{errors.categoryOther}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div>
        <label className={labelClassName} htmlFor="majorServices">
          Major services <span className="text-error">*</span>
        </label>
        <textarea
          className={`${fieldClassName(Boolean(errors.majorServices))} min-h-28 py-2`}
          id="majorServices"
          onChange={(e) => update("majorServices", e.target.value)}
          placeholder="e.g. General Medicine, Surgery, ICU, Maternity"
          rows={4}
          value={form.majorServices}
        />
        {errors.majorServices ? <p className={errorClassName}>{errors.majorServices}</p> : null}
      </div>

      {isDiagnostic ? (
        <>
          <div>
            <label className={labelClassName} htmlFor="testTypes">
              Test types
            </label>
            <textarea
              className={`${fieldClassName(false)} min-h-28 py-2`}
              id="testTypes"
              onChange={(e) => update("testTypes", e.target.value)}
              placeholder="e.g. Blood tests, MRI, CT Scan, Ultrasound, X-ray"
              rows={4}
              value={form.testTypes}
            />
          </div>
          <div>
            <label className={labelClassName}>Sample collection available?</label>
            <YesNoToggle
              onChange={(v) => update("sampleCollectionAvailable", v)}
              value={form.sampleCollectionAvailable}
            />
          </div>
          <div>
            <label className={labelClassName}>Home sample collection?</label>
            <YesNoToggle
              onChange={(v) => update("homeSampleCollection", v)}
              value={form.homeSampleCollection}
            />
          </div>
        </>
      ) : (
        <div>
          <label className={labelClassName} htmlFor="specialtiesAvailable">
            Specialties available
          </label>
          <textarea
            className={`${fieldClassName(false)} min-h-28 py-2`}
            id="specialtiesAvailable"
            onChange={(e) => update("specialtiesAvailable", e.target.value)}
            placeholder="e.g. Cardiology, Neurology, Orthopedics"
            rows={4}
            value={form.specialtiesAvailable}
          />
        </div>
      )}

      <div>
        <label className={labelClassName}>Branches?</label>
        <YesNoToggle onChange={(v) => update("hasBranches", v)} value={form.hasBranches} />
        {form.hasBranches ? (
          <BranchSection
            addBranch={addBranch}
            branches={form.branches}
            removeBranch={removeBranch}
            updateBranch={updateBranch}
          />
        ) : null}
      </div>

      <div>
        <label className={labelClassName} htmlFor="opdHours">
          OPD hours <span className="text-error">*</span>
        </label>
        <input
          className={fieldClassName(Boolean(errors.opdHours))}
          id="opdHours"
          onChange={(e) => update("opdHours", e.target.value)}
          placeholder="e.g. Mon–Sat 8am–6pm"
          type="text"
          value={form.opdHours}
        />
        {errors.opdHours ? <p className={errorClassName}>{errors.opdHours}</p> : null}
      </div>

      <div>
        <label className={labelClassName}>Emergency service?</label>
        <YesNoToggle onChange={(v) => update("hasEmergency", v)} value={form.hasEmergency} />
        {form.hasEmergency ? (
          <div className="mt-3">
            <select
              className={fieldClassName(Boolean(errors.emergencyType))}
              onChange={(e) => update("emergencyType", e.target.value)}
              value={form.emergencyType}
            >
              <option disabled value="">
                Select availability
              </option>
              <option value="24/7 Emergency">24/7 Emergency</option>
              <option value="Limited hours">Limited hours</option>
            </select>
            {errors.emergencyType ? (
              <p className={errorClassName}>{errors.emergencyType}</p>
            ) : null}
            {form.emergencyType === "Limited hours" ? (
              <div className="mt-2">
                <input
                  className={fieldClassName(Boolean(errors.emergencyHours))}
                  onChange={(e) => update("emergencyHours", e.target.value)}
                  placeholder="Emergency hours"
                  type="text"
                  value={form.emergencyHours}
                />
                {errors.emergencyHours ? (
                  <p className={errorClassName}>{errors.emergencyHours}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {!form.hasBranches ? (
        <div>
          <label className={labelClassName} htmlFor="subCity">
            Sub-city / Area <span className="text-error">*</span>
          </label>
          <input
            className={fieldClassName(Boolean(errors.subCity))}
            id="subCity"
            onChange={(e) => update("subCity", e.target.value)}
            type="text"
            value={form.subCity}
          />
          {errors.subCity ? <p className={errorClassName}>{errors.subCity}</p> : null}
        </div>
      ) : null}

      <div>
        <label className={labelClassName} htmlFor="address">
          Address
        </label>
        <input
          className={fieldClassName(false)}
          id="address"
          onChange={(e) => update("address", e.target.value)}
          type="text"
          value={form.address}
        />
      </div>

      <div>
        <label className={labelClassName} htmlFor="phone">
          Phone <span className="text-error">*</span>
        </label>
        <input
          className={fieldClassName(Boolean(errors.phone))}
          id="phone"
          onChange={(e) => update("phone", e.target.value)}
          type="tel"
          value={form.phone}
        />
        {errors.phone ? <p className={errorClassName}>{errors.phone}</p> : null}
        <p className={phoneHintClassName}>Separate multiple numbers with /</p>
      </div>

      <div>
        <label className={labelClassName} htmlFor="email">
          Email
        </label>
        <input
          className={fieldClassName(false)}
          id="email"
          onChange={(e) => update("email", e.target.value)}
          type="email"
          value={form.email}
        />
      </div>

      <div>
        <label className={labelClassName} htmlFor="website">
          Website
        </label>
        <input
          className={fieldClassName(false)}
          id="website"
          onChange={(e) => update("website", e.target.value)}
          type="url"
          value={form.website}
        />
      </div>

      <div>
        <label className={labelClassName} htmlFor="telegram">
          Telegram
        </label>
        <input
          className={fieldClassName(false)}
          id="telegram"
          onChange={(e) => update("telegram", e.target.value)}
          type="text"
          value={form.telegram}
        />
      </div>

      <SocialMediaFields form={form} update={update} />

      {!form.hasBranches ? (
        <div>
          <label className={labelClassName} htmlFor="googleMapsUrl">
            Google Maps link
          </label>
          <input
            className={fieldClassName(false)}
            id="googleMapsUrl"
            onChange={(e) => update("googleMapsUrl", e.target.value)}
            type="url"
            value={form.googleMapsUrl}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Used for Nearby search — paste your Google Maps share link
          </p>
        </div>
      ) : null}
    </>
  );
}

type PharmacyFieldsProps = {
  form: FormState;
  errors: Record<string, string>;
  update: Updater;
  updateBranch: (id: string, patch: Partial<BranchEntry>) => void;
  addBranch: () => void;
  removeBranch: (id: string) => void;
};

function PharmacyFields({
  form,
  errors,
  update,
  updateBranch,
  addBranch,
  removeBranch,
}: PharmacyFieldsProps) {
  return (
    <>
      <div>
        <label className={labelClassName} htmlFor="pharmacyServices">
          Services
        </label>
        <textarea
          className={`${fieldClassName(false)} min-h-28 py-2`}
          id="pharmacyServices"
          onChange={(e) => update("pharmacyServices", e.target.value)}
          placeholder="e.g. Prescription dispensing, Compounding"
          rows={4}
          value={form.pharmacyServices}
        />
      </div>

      <div>
        <label className={labelClassName}>Delivery available?</label>
        <YesNoToggle onChange={(v) => update("deliveryAvailable", v)} value={form.deliveryAvailable} />
      </div>

      <div>
        <label className={labelClassName}>Branches?</label>
        <YesNoToggle onChange={(v) => update("hasBranches", v)} value={form.hasBranches} />
        {form.hasBranches ? (
          <BranchSection
            addBranch={addBranch}
            branches={form.branches}
            removeBranch={removeBranch}
            updateBranch={updateBranch}
          />
        ) : null}
      </div>

      {!form.hasBranches ? (
        <div>
          <label className={labelClassName} htmlFor="subCity">
            Sub-city / Area <span className="text-error">*</span>
          </label>
          <input
            className={fieldClassName(Boolean(errors.subCity))}
            id="subCity"
            onChange={(e) => update("subCity", e.target.value)}
            type="text"
            value={form.subCity}
          />
          {errors.subCity ? <p className={errorClassName}>{errors.subCity}</p> : null}
        </div>
      ) : null}

      <div>
        <label className={labelClassName} htmlFor="phone">
          Phone <span className="text-error">*</span>
        </label>
        <input
          className={fieldClassName(Boolean(errors.phone))}
          id="phone"
          onChange={(e) => update("phone", e.target.value)}
          type="tel"
          value={form.phone}
        />
        {errors.phone ? <p className={errorClassName}>{errors.phone}</p> : null}
        <p className={phoneHintClassName}>Separate multiple numbers with /</p>
      </div>

      <SocialMediaFields form={form} update={update} />

      {!form.hasBranches ? (
        <div>
          <label className={labelClassName} htmlFor="googleMapsUrl">
            Google Maps link
          </label>
          <input
            className={fieldClassName(false)}
            id="googleMapsUrl"
            onChange={(e) => update("googleMapsUrl", e.target.value)}
            type="url"
            value={form.googleMapsUrl}
          />
        </div>
      ) : null}
    </>
  );
}

type AmbulanceServiceFieldsProps = {
  form: FormState;
  errors: Record<string, string>;
  update: Updater;
  updateBranch: (id: string, patch: Partial<BranchEntry>) => void;
  addBranch: () => void;
  removeBranch: (id: string) => void;
};

function AmbulanceServiceFields({
  form,
  errors,
  update,
  updateBranch,
  addBranch,
  removeBranch,
}: AmbulanceServiceFieldsProps) {
  function toggleServiceType(type: string) {
    const next = form.ambulanceServiceTypes.includes(type)
      ? form.ambulanceServiceTypes.filter((t) => t !== type)
      : [...form.ambulanceServiceTypes, type];
    update("ambulanceServiceTypes", next);
  }

  return (
    <>
      <div>
        <label className={labelClassName} htmlFor="ambulanceCoverageArea">
          Coverage area <span className="text-error">*</span>
        </label>
        <input
          className={fieldClassName(Boolean(errors.ambulanceCoverageArea))}
          id="ambulanceCoverageArea"
          onChange={(e) => update("ambulanceCoverageArea", e.target.value)}
          placeholder="e.g. Bole, Kirkos, Yeka — or All Addis Ababa"
          type="text"
          value={form.ambulanceCoverageArea}
        />
        {errors.ambulanceCoverageArea ? (
          <p className={errorClassName}>{errors.ambulanceCoverageArea}</p>
        ) : null}
      </div>

      <div>
        <label className={labelClassName} htmlFor="ambulanceFleetSize">
          Number of ambulances
        </label>
        <input
          className={fieldClassName(false)}
          id="ambulanceFleetSize"
          min="1"
          onChange={(e) => update("ambulanceFleetSize", e.target.value)}
          type="number"
          value={form.ambulanceFleetSize}
        />
      </div>

      <div>
        <label className={labelClassName}>Available 24/7?</label>
        <YesNoToggle
          onChange={(v) => update("ambulanceAvailable247", v)}
          value={form.ambulanceAvailable247}
        />
        {!form.ambulanceAvailable247 ? (
          <div className="mt-3">
            <label className={labelClassName} htmlFor="ambulanceAvailableHours">
              Available hours
            </label>
            <input
              className={fieldClassName(false)}
              id="ambulanceAvailableHours"
              onChange={(e) => update("ambulanceAvailableHours", e.target.value)}
              placeholder="e.g. Mon–Sat 7am–10pm"
              type="text"
              value={form.ambulanceAvailableHours}
            />
          </div>
        ) : null}
      </div>

      <div>
        <label className={labelClassName}>Service type</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {AMBULANCE_SERVICE_TYPES.map((type) => {
            const active = form.ambulanceServiceTypes.includes(type);
            return (
              <button
                className={`${toggleBaseClassName} ${active ? toggleActiveClassName : toggleInactiveClassName}`}
                key={type}
                onClick={() => toggleServiceType(type)}
                type="button"
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelClassName} htmlFor="ambulanceEquipment">
          Equipment on board
        </label>
        <textarea
          className={`${fieldClassName(false)} min-h-28 py-2`}
          id="ambulanceEquipment"
          onChange={(e) => update("ambulanceEquipment", e.target.value)}
          placeholder="e.g. Oxygen, Defibrillator, Stretcher, Paramedic staff"
          rows={4}
          value={form.ambulanceEquipment}
        />
      </div>

      <div>
        <label className={labelClassName} htmlFor="ambulanceResponseTime">
          Average response time
        </label>
        <input
          className={fieldClassName(false)}
          id="ambulanceResponseTime"
          onChange={(e) => update("ambulanceResponseTime", e.target.value)}
          placeholder="e.g. 10–15 minutes within Bole"
          type="text"
          value={form.ambulanceResponseTime}
        />
      </div>

      <div>
        <label className={labelClassName}>Branches?</label>
        <YesNoToggle onChange={(v) => update("hasBranches", v)} value={form.hasBranches} />
        {form.hasBranches ? (
          <BranchSection
            addBranch={addBranch}
            branches={form.branches}
            removeBranch={removeBranch}
            updateBranch={updateBranch}
          />
        ) : null}
      </div>

      {!form.hasBranches ? (
        <div>
          <label className={labelClassName} htmlFor="subCity">
            Sub-city / Area
          </label>
          <input
            className={fieldClassName(false)}
            id="subCity"
            onChange={(e) => update("subCity", e.target.value)}
            type="text"
            value={form.subCity}
          />
        </div>
      ) : null}

      <div>
        <label className={labelClassName} htmlFor="phone">
          Phone <span className="text-error">*</span>
        </label>
        <input
          className={fieldClassName(Boolean(errors.phone))}
          id="phone"
          onChange={(e) => update("phone", e.target.value)}
          type="tel"
          value={form.phone}
        />
        {errors.phone ? <p className={errorClassName}>{errors.phone}</p> : null}
        <p className={phoneHintClassName}>Separate multiple numbers with /</p>
      </div>

      <div>
        <label className={labelClassName} htmlFor="email">
          Email
        </label>
        <input
          className={fieldClassName(false)}
          id="email"
          onChange={(e) => update("email", e.target.value)}
          type="email"
          value={form.email}
        />
      </div>

      <SocialMediaFields form={form} update={update} />

      {!form.hasBranches ? (
        <div>
          <label className={labelClassName} htmlFor="ambulanceBaseLocation">
            Base location (Google Maps link)
          </label>
          <input
            className={fieldClassName(false)}
            id="ambulanceBaseLocation"
            onChange={(e) => update("ambulanceBaseLocation", e.target.value)}
            type="url"
            value={form.ambulanceBaseLocation}
          />
        </div>
      ) : null}
    </>
  );
}

type OtherFieldsProps = {
  form: FormState;
  errors: Record<string, string>;
  update: Updater;
};

function OtherFields({ form, errors, update }: OtherFieldsProps) {
  return (
    <>
      <div>
        <label className={labelClassName} htmlFor="otherDescription">
          Description <span className="text-error">*</span>
        </label>
        <textarea
          className={`${fieldClassName(Boolean(errors.otherDescription))} min-h-28 py-2`}
          id="otherDescription"
          onChange={(e) => update("otherDescription", e.target.value)}
          rows={4}
          value={form.otherDescription}
        />
        {errors.otherDescription ? (
          <p className={errorClassName}>{errors.otherDescription}</p>
        ) : null}
      </div>

      <div>
        <label className={labelClassName} htmlFor="phone">
          Phone <span className="text-error">*</span>
        </label>
        <input
          className={fieldClassName(Boolean(errors.phone))}
          id="phone"
          onChange={(e) => update("phone", e.target.value)}
          type="tel"
          value={form.phone}
        />
        {errors.phone ? <p className={errorClassName}>{errors.phone}</p> : null}
        <p className={phoneHintClassName}>Separate multiple numbers with /</p>
      </div>

      <div>
        <label className={labelClassName} htmlFor="subCity">
          Sub-city <span className="text-error">*</span>
        </label>
        <input
          className={fieldClassName(Boolean(errors.subCity))}
          id="subCity"
          onChange={(e) => update("subCity", e.target.value)}
          type="text"
          value={form.subCity}
        />
        {errors.subCity ? <p className={errorClassName}>{errors.subCity}</p> : null}
      </div>
    </>
  );
}

function getNameLabel(providerType: ProviderType) {
  if (providerType === "Specialist") return "Full name";
  if (providerType === "Healthcare Facility" || providerType === "Diagnostic Center") {
    return "Healthcare facility name";
  }
  if (providerType === "Pharmacy") return "Pharmacy name";
  if (providerType === "Ambulance Service") return "Ambulance service name";
  return "Provider/service name";
}

export function RegisterPage() {
  const searchParams = useSearchParams();
  const isUpdate = searchParams.get("update") === "true";
  const updateName = searchParams.get("name") ?? "";

  const idCounterRef = useRef(0);
  function nextId(prefix: string) {
    idCounterRef.current += 1;
    return `${prefix}-${idCounterRef.current}`;
  }

  const [providerType, setProviderType] = useState<ProviderType>("Specialist");
  const [form, setForm] = useState<FormState>(() => createInitialState(updateName));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");

  const update: Updater = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  function handleProviderTypeChange(value: ProviderType) {
    setProviderType(value);
    setErrors({});
  }

  function updateFacilityEntry(id: string, patch: Partial<FacilityEntry>) {
    setForm((prev) => ({
      ...prev,
      facilityEntries: prev.facilityEntries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }

  function toggleFacilityDay(id: string, day: string) {
    setForm((prev) => ({
      ...prev,
      facilityEntries: prev.facilityEntries.map((e) => {
        if (e.id !== id) return e;
        const days = e.days.includes(day) ? e.days.filter((d) => d !== day) : [...e.days, day];
        return { ...e, days };
      }),
    }));
  }

  function addFacilityEntry() {
    setForm((prev) => ({
      ...prev,
      facilityEntries: [...prev.facilityEntries, createFacilityEntry(nextId("facility-entry"))],
    }));
  }

  function removeFacilityEntry(id: string) {
    setForm((prev) => ({
      ...prev,
      facilityEntries: prev.facilityEntries.filter((e) => e.id !== id),
    }));
  }

  function updateBranch(id: string, patch: Partial<BranchEntry>) {
    setForm((prev) => ({
      ...prev,
      branches: prev.branches.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }

  function addBranch() {
    setForm((prev) => ({
      ...prev,
      branches: [...prev.branches, createBranchEntry(nextId("branch"))],
    }));
  }

  function removeBranch(id: string) {
    setForm((prev) => ({
      ...prev,
      branches: prev.branches.filter((b) => b.id !== id),
    }));
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs.name = "This field is required.";
    if (!form.phone.trim()) errs.phone = "Phone is required.";
    if (!form.submitterName.trim()) errs.submitterName = "Your name is required.";
    if (!form.submitterContact.trim()) errs.submitterContact = "Your contact is required.";

    if (providerType === "Specialist") {
      if (!form.specialty.trim()) {
        errs.specialty = "Please select a specialty.";
      } else if (form.specialty === "Other" && !form.specialtyOther.trim()) {
        errs.specialtyOther = "Please enter the specialty.";
      }
      const hasPractice = form.facilityEntries.some(
        (e) => e.searchFacility.trim() || e.manualFacility.trim(),
      );
      if (!hasPractice) errs.facilities = "Please tell us where you practice.";
      form.facilityEntries.forEach((entry) => {
        if (!entry.searchFacility.trim() && !entry.manualFacility.trim()) return;
        if (entry.days.length === 0 || !entry.startTime || !entry.endTime) {
          errs[`schedule-${entry.id}`] = "Please add consultation days and times.";
        }
      });
    }

    if (providerType === "Healthcare Facility" || providerType === "Diagnostic Center") {
      if (!form.category.trim()) {
        errs.category = "Please select a category.";
      } else if (form.category === "Other" && !form.categoryOther.trim()) {
        errs.categoryOther = "Please enter the category.";
      }
      if (!form.majorServices.trim()) errs.majorServices = "Please list major services.";
      if (!form.opdHours.trim()) errs.opdHours = "OPD hours are required.";
      if (!form.hasBranches && !form.subCity.trim()) {
        errs.subCity = "Sub-city / area is required.";
      }
      if (form.hasEmergency) {
        if (!form.emergencyType.trim()) {
          errs.emergencyType = "Please select emergency availability.";
        } else if (form.emergencyType === "Limited hours" && !form.emergencyHours.trim()) {
          errs.emergencyHours = "Please enter emergency hours.";
        }
      }
    }

    if (providerType === "Pharmacy") {
      if (!form.hasBranches && !form.subCity.trim()) {
        errs.subCity = "Sub-city / area is required.";
      }
    }

    if (providerType === "Ambulance Service") {
      if (!form.ambulanceCoverageArea.trim()) {
        errs.ambulanceCoverageArea = "Coverage area is required.";
      }
    }

    if (providerType === "Other") {
      if (!form.otherDescription.trim()) errs.otherDescription = "Please add a description.";
      if (!form.subCity.trim()) errs.subCity = "Sub-city is required.";
    }

    return errs;
  }

  function buildNotes(): Record<string, unknown> {
    if (providerType === "Specialist") {
      return {
        specialty: form.specialty === "Other" ? form.specialtyOther : form.specialty,
        subSpecialty: form.subSpecialty || null,
        multipleFacilities: form.multipleFacilities,
        practiceLocations: form.facilityEntries
          .filter((e) => e.searchFacility.trim() || e.manualFacility.trim())
          .map((e) => ({
            tiruFacility: e.searchFacility || null,
            manualFacility: e.manualFacility || null,
            days: e.days,
            startTime: e.startTime || null,
            endTime: e.endTime || null,
          })),
        telemedicineAvailable: form.telemedicineAvailable,
        telemedicineDetails: form.telemedicineAvailable ? form.telemedicineDetails || null : null,
        bookingLink: form.bookingLink || null,
        linkedin: form.linkedin || null,
      };
    }

    if (providerType === "Healthcare Facility" || providerType === "Diagnostic Center") {
      const base: Record<string, unknown> = {
        category: form.category === "Other" ? form.categoryOther : form.category,
        majorServices: form.majorServices,
        hasBranches: form.hasBranches,
        branches: form.hasBranches ? form.branches : [],
        opdHours: form.opdHours,
        hasEmergency: form.hasEmergency,
        emergencyType: form.hasEmergency ? form.emergencyType : null,
        emergencyHours:
          form.hasEmergency && form.emergencyType === "Limited hours"
            ? form.emergencyHours
            : null,
        subCity: form.hasBranches ? null : form.subCity || null,
        address: form.address || null,
        website: form.website || null,
        telegram: form.telegram || null,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        tiktok: form.tiktok || null,
        googleMapsUrl: form.hasBranches ? null : form.googleMapsUrl || null,
        submitterRole: form.submitterRole || null,
      };

      if (providerType === "Healthcare Facility") {
        base.specialtiesAvailable = form.specialtiesAvailable || null;
      } else {
        base.testTypes = form.testTypes || null;
        base.sampleCollectionAvailable = form.sampleCollectionAvailable;
        base.homeSampleCollection = form.homeSampleCollection;
      }

      return base;
    }

    if (providerType === "Pharmacy") {
      return {
        services: form.pharmacyServices || null,
        deliveryAvailable: form.deliveryAvailable,
        hasBranches: form.hasBranches,
        branches: form.hasBranches ? form.branches : [],
        subCity: form.hasBranches ? null : form.subCity || null,
        googleMapsUrl: form.hasBranches ? null : form.googleMapsUrl || null,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        tiktok: form.tiktok || null,
      };
    }

    if (providerType === "Ambulance Service") {
      return {
        coverageArea: form.ambulanceCoverageArea,
        fleetSize: form.ambulanceFleetSize || null,
        available247: form.ambulanceAvailable247,
        availableHours: form.ambulanceAvailable247 ? null : form.ambulanceAvailableHours || null,
        serviceTypes: form.ambulanceServiceTypes,
        equipment: form.ambulanceEquipment || null,
        responseTime: form.ambulanceResponseTime || null,
        hasBranches: form.hasBranches,
        branches: form.hasBranches ? form.branches : [],
        subCity: form.hasBranches ? null : form.subCity || null,
        baseLocation: form.hasBranches ? null : form.ambulanceBaseLocation || null,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        tiktok: form.tiktok || null,
      };
    }

    return { description: form.otherDescription, subCity: form.subCity };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSubmitState("error");
      setSubmitError("Registration is unavailable right now. Please try again later.");
      return;
    }

    setSubmitState("submitting");

    const notes = {
      providerType,
      submitterName: form.submitterName,
      submitterContact: form.submitterContact,
      ...buildNotes(),
    };

    const { error } = await supabase.from("listing_requests").insert({
      provider_type: providerType,
      provider_name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      notes: JSON.stringify(notes),
    });

    if (error) {
      setSubmitState("error");
      setSubmitError("Something went wrong submitting your request. Please try again.");
      return;
    }

    setSubmitState("success");
  }

  if (submitState === "success") {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <h1 className="text-lg font-semibold text-green-800">✓ Submission received.</h1>
          <p className="mt-2 text-sm leading-6 text-green-800">
            Our team will review your information and contact you at the details you provided
            before your listing goes live. This usually takes 24–48 hours.
          </p>
          <Link className="mt-5 inline-flex text-sm font-semibold text-green-800 underline" href="/">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
      {isUpdate ? (
        <div className="mb-4 rounded-lg border border-[#FCD34D] bg-[#FEF3C7] p-3 text-sm font-semibold text-[#92400E] dark:border-[#B45309] dark:bg-[#451A03] dark:text-[#FCD34D]">
          Updating existing listing{updateName ? `: ${updateName}` : ""}
        </div>
      ) : null}

      <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
        List a provider
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Takes a few minutes. We review every submission and contact you before publishing.
      </p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <div>
          <label className={labelClassName} htmlFor="providerType">
            Provider type
          </label>
          <select
            className={fieldClassName(false)}
            id="providerType"
            onChange={(e) => handleProviderTypeChange(e.target.value as ProviderType)}
            value={providerType}
          >
            {PROVIDER_TYPE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor="name">
            {getNameLabel(providerType)} <span className="text-error">*</span>
          </label>
          <input
            className={fieldClassName(Boolean(errors.name))}
            id="name"
            onChange={(e) => update("name", e.target.value)}
            type="text"
            value={form.name}
          />
          {errors.name ? <p className={errorClassName}>{errors.name}</p> : null}
        </div>

        {providerType === "Specialist" ? (
          <SpecialistFields
            addFacilityEntry={addFacilityEntry}
            errors={errors}
            form={form}
            removeFacilityEntry={removeFacilityEntry}
            toggleFacilityDay={toggleFacilityDay}
            update={update}
            updateFacilityEntry={updateFacilityEntry}
          />
        ) : null}

        {providerType === "Healthcare Facility" || providerType === "Diagnostic Center" ? (
          <FacilityLikeFields
            addBranch={addBranch}
            errors={errors}
            form={form}
            isDiagnostic={providerType === "Diagnostic Center"}
            removeBranch={removeBranch}
            update={update}
            updateBranch={updateBranch}
          />
        ) : null}

        {providerType === "Pharmacy" ? (
          <PharmacyFields
            addBranch={addBranch}
            errors={errors}
            form={form}
            removeBranch={removeBranch}
            update={update}
            updateBranch={updateBranch}
          />
        ) : null}

        {providerType === "Ambulance Service" ? (
          <AmbulanceServiceFields
            addBranch={addBranch}
            errors={errors}
            form={form}
            removeBranch={removeBranch}
            update={update}
            updateBranch={updateBranch}
          />
        ) : null}

        {providerType === "Other" ? (
          <OtherFields errors={errors} form={form} update={update} />
        ) : null}

        <div className="my-8 border-t border-border pt-6">
          <p className="text-sm font-semibold uppercase text-muted-foreground">Your details</p>
        </div>

        <div>
          <label className={labelClassName} htmlFor="submitterName">
            Submitter name <span className="text-error">*</span>
          </label>
          <input
            className={fieldClassName(Boolean(errors.submitterName))}
            id="submitterName"
            onChange={(e) => update("submitterName", e.target.value)}
            type="text"
            value={form.submitterName}
          />
          {errors.submitterName ? <p className={errorClassName}>{errors.submitterName}</p> : null}
        </div>

        {providerType === "Healthcare Facility" || providerType === "Diagnostic Center" ? (
          <div>
            <label className={labelClassName} htmlFor="submitterRole">
              Submitter role
            </label>
            <input
              className={fieldClassName(false)}
              id="submitterRole"
              onChange={(e) => update("submitterRole", e.target.value)}
              placeholder="e.g. Manager, Owner, Admin"
              type="text"
              value={form.submitterRole}
            />
          </div>
        ) : null}

        <div>
          <label className={labelClassName} htmlFor="submitterContact">
            Submitter contact <span className="text-error">*</span>
          </label>
          <input
            className={fieldClassName(Boolean(errors.submitterContact))}
            id="submitterContact"
            onChange={(e) => update("submitterContact", e.target.value)}
            placeholder="Phone or email"
            type="text"
            value={form.submitterContact}
          />
          {errors.submitterContact ? (
            <p className={errorClassName}>{errors.submitterContact}</p>
          ) : null}
        </div>

        {submitState === "error" ? <p className={errorClassName}>{submitError}</p> : null}

        <button
          className="mt-8 w-full min-h-12 rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60"
          disabled={submitState === "submitting"}
          type="submit"
        >
          {submitState === "submitting" ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
