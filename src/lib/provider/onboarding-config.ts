export const ONBOARDING_STEPS = [
  { num: 1, slug: "identity", label: "Basic Identity", weight: 10 },
  { num: 2, slug: "location", label: "Location & Contact", weight: 30 },
  { num: 3, slug: "services", label: "Services & Schedule", weight: 30 },
  { num: 4, slug: "doctors", label: "Doctors & Staff", weight: 10 },
  { num: 5, slug: "media", label: "Photos & Documents", weight: 15 },
  { num: 6, slug: "review", label: "Review & Submit", weight: 5 },
] as const;

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

// Steps 1+2+3 (10 + 30 + 30) sum to this — the threshold for Official badge eligibility
export const OFFICIAL_BADGE_THRESHOLD_PCT = 70;

// Provider category options
// The one non-category choice offered at signup. Kept because real cases
// exist that the 7-category taxonomy does not cover (the live data has a
// telemedicine provider and a healthcare-financing service). It is NOT a
// storable facilities.category — approval refuses to publish it and asks
// an admin to choose a real category first.
export const OTHER_FACILITY_TYPE = "Other";

export const OWNERSHIP_TYPES = [
  "Private",
  "NGO / Charity",
  "Faith-based",
  "Corporate / Group practice",
  "Other",
] as const;

export const LANGUAGES = [
  "Amharic",
  "English",
  "Afaan Oromo",
  "Tigrinya",
  "Somali",
  "Arabic",
] as const;

export const PATIENT_GROUPS = [
  "Adults",
  "Children",
  "Women's health",
  "Elderly",
  "Family care",
  "Emergency patients",
  "Chronic disease patients",
] as const;

export const CLAIMANT_ROLES = [
  "Owner",
  "Medical Director",
  "Manager",
  "Administrator",
  "Marketing Officer",
  "Executive",
  "Reception",
  "Other",
] as const;

export const ADDIS_SUB_CITIES = [
  "Addis Ketema",
  "Akaki Kaliti",
  "Arada",
  "Bole",
  "Gulele",
  "Kirkos",
  "Kolfe Keranio",
  "Lideta",
  "Nifas Silk-Lafto",
  "Yeka",
  "Lemi Kura",
  "Multiple",
] as const;

export const MAIN_SERVICES = [
  "General OPD / Outpatient consultation",
  "Specialist consultation",
  "Emergency care",
  "Inpatient admission",
  "ICU",
  "NICU",
  "Delivery / Maternity care",
  "Minor surgery",
  "Major surgery",
  "Dialysis",
  "Dental procedure",
  "Eye care procedure",
  "Vaccination",
  "Travel medicine",
  "Chronic disease follow-up",
  "Executive / Comprehensive check-up",
  "Home visit",
  "Telemedicine consultation",
  "Medical certificate",
  "Laboratory service",
  "Imaging / Radiology",
  "Pharmacy service",
  "Blood bank",
  "Ambulance service",
] as const;

export const SPECIALTIES = [
  "Internal Medicine",
  "Pediatrics",
  "Obstetrics and Gynecology",
  "General Surgery",
  "Orthopedics",
  "Cardiology",
  "Gastroenterology",
  "Neurology",
  "Neurosurgery",
  "Psychiatry",
  "Dermatology",
  "ENT",
  "Ophthalmology",
  "Dental",
  "Urology",
  "Nephrology",
  "Pulmonology",
  "Endocrinology",
  "Rheumatology",
  "Oncology",
  "Hematology",
  "Radiology",
  "Pathology",
  "Emergency Medicine",
  "Family Medicine",
  "Physiotherapy",
  "Nutrition and Dietetics",
  "Psychology / Counseling",
  "MCH (Maternal and Child Health)",
] as const;

export const PAYMENT_METHODS = [
  "Cash",
  "Bank transfer",
  "CBE Birr",
  "Telebirr",
  "POS / Card",
  "Visa / Mastercard",
  "Insurance",
  "Corporate credit agreement",
] as const;

export const IMAGING_SERVICES = [
  "X-Ray",
  "Ultrasound",
  "CT Scan",
  "MRI",
  "Mammography",
  "Fluoroscopy",
  "DEXA Scan",
  "PET Scan",
  "Nuclear Medicine",
  "Echocardiography",
  "ECG / EKG",
  "EEG",
  "Spirometry",
  "Endoscopy",
  "Colonoscopy",
  "Bronchoscopy",
  "Colposcopy",
  "Doppler Ultrasound",
  "Bone Marrow Biopsy",
  "Interventional Radiology",
] as const;

// Each key is a panel a lab either runs or does not, which is how a lab
// actually thinks about its own menu — the UI ticks the whole panel from one
// checkbox and only then reveals the individual tests to deselect. That is why
// adding panels here makes the form shorter to fill in rather than longer: ten
// checkboxes replace a hundred pills, and the pills stay available for the lab
// that runs eight of a panel's ten tests.
//
// The panels below the original nine were added after the live data showed
// Diagnostic Centers hand-typing entries this list already covered — "Organ
// function test", "Serum electrolite", "Autoimmuine markers", "Urine
// analysis", "stool test", all five from one facility, two misspelled, one
// ("Urine analysis") duplicating a Urinalysis pill it had already ticked. They
// were typing because the diagnostic branch of the form never showed them this
// catalogue, not because the catalogue lacked the concepts. The gaps that were
// real are the panels a referring doctor asks for by name and no group here
// held: coagulation, cardiac markers, iron studies, tumour markers, and the
// blood bank work any lab of ICL's size does daily.
export const BASIC_LAB_CATEGORIES: Record<string, string[]> = {
  "Basic Blood Workup": ["CBC", "ESR", "CRP", "RBS", "FBS", "HbA1c", "Lipid Profile", "Peripheral Blood Film"],
  "Basic Serum Chemistry": ["Electrolytes (Na/K/Cl)", "LFT (AST/ALT/ALP/Bilirubin)", "RFT (BUN/Creatinine)", "Uric Acid", "Total Protein/Albumin", "Calcium", "Phosphorus", "Magnesium", "Amylase", "Lipase"],
  "Coagulation Profile": ["PT / INR", "APTT", "D-dimer", "Fibrinogen", "Bleeding Time", "Clotting Time"],
  "Cardiac Markers": ["Troponin I/T", "CK-MB", "CK Total", "LDH", "BNP / NT-proBNP"],
  "Anaemia & Iron Studies": ["Serum Ferritin", "Serum Iron", "TIBC", "Vitamin B12", "Folate", "Reticulocyte Count", "Sickling Test", "Haemoglobin Electrophoresis"],
  "Hormonal Workup": ["TSH", "Free T3", "Free T4", "Anti-TPO", "FSH", "LH", "Prolactin", "Testosterone", "Progesterone", "Estradiol", "Beta-hCG (Serum)", "Cortisol", "Insulin", "Parathyroid Hormone (PTH)", "Vitamin D"],
  "Tumour Markers": ["PSA", "CA-125", "CEA", "AFP", "CA 19-9", "CA 15-3"],
  "Basic Urine-based Tests": ["Urinalysis", "Pregnancy Test (Urine hCG)", "Microalbumin", "Urine Protein/Creatinine Ratio", "24-hour Urine Protein"],
  "Basic Stool Test": ["Stool Direct/Microscopy", "H. pylori Antigen", "Occult Blood"],
  "Culture & Sensitivity": ["Blood Culture", "Urine Culture", "Stool Culture", "Body Fluid Culture", "Wound/Swab Culture", "Throat Culture", "Sputum Culture"],
  "Body Fluid Analysis": ["Pleural Fluid", "Peritoneal (Ascitic) Fluid", "CSF Analysis", "Synovial Fluid"],
  "Autoimmune Markers": ["ANA", "P-ANCA", "C-ANCA", "RF", "Anti-dsDNA", "Anti-CCP"],
  "Serology & Infectious Disease Screening": ["HIV", "RPR/VDRL", "HBsAg", "HBeAg", "Anti-HBs", "Anti-HCV", "Hepatitis A IgM", "Widal Test", "Brucella (Rose Bengal)", "Toxoplasma IgG/IgM", "Rubella IgG/IgM", "Malaria (RDT/Blood Film)", "TB (GeneXpert/AFB)"],
  "Sexually Transmitted Infections": ["STI Panel", "Gonorrhoea (NAAT/Culture)", "Chlamydia (NAAT)", "Trichomonas", "HSV 1/2"],
  "Histopathology & Cytology": ["Histopathology", "Cytology", "Pap Smear", "FNAC", "Frozen Section", "Immunohistochemistry"],
  "Molecular & Genetic Testing": ["Genetic Testing", "PCR (General)", "Karyotyping", "COVID-19 Testing", "COVID-19 PCR"],
  "Transfusion & Blood Bank": ["Blood Group & Rh", "Cross-matching", "Direct Coombs", "Indirect Coombs", "Antibody Screening"],
  "Other Specialised Tests": ["Semen Analysis", "Allergy Panel (Total/Specific IgE)", "Procalcitonin", "Serum Protein Electrophoresis", "Toxicology Screen", "Therapeutic Drug Monitoring", "ELISA-based Assays"],
};

export const ALL_BASIC_LAB_TESTS: string[] = Object.values(BASIC_LAB_CATEGORIES).flat();

export const DIAGNOSTIC_SUBTYPE_OPTIONS = [
  { value: "lab", label: "Laboratory only" },
  { value: "imaging", label: "Imaging only" },
  { value: "both", label: "Both — laboratory and imaging" },
] as const;

export const PHARMACY_CATEGORIES = [
  "Prescription (Rx)",
  "OTC Medications",
  "Supplements & Vitamins",
  "Compounding",
  "Veterinary",
  "Controlled Substances",
  "Vaccines",
  "Medical Supplies & Equipment",
  "Cosmetics & Personal Care",
  "Baby & Maternal Care",
] as const;

export const DELIVERY_OPTIONS = ["In-store only", "Delivery only", "Both"] as const;

// Distinct from ADDIS_SUB_CITIES (used by Step 2 location) — this list and
// spelling was specified for delivery/coverage-area selectors (Pharmacy,
// Home Care, Ambulance) and includes "Cherkos" which the Step 2 list doesn't.
export const COVERAGE_SUB_CITIES = [
  "Addis Ketema",
  "Akaky Kaliti",
  "Arada",
  "Bole",
  "Gullele",
  "Kirkos",
  "Kolfe Keranio",
  "Lideta",
  "Nifas Silk-Lafto",
  "Yeka",
  "Lemi-Kura",
  "Cherkos",
] as const;

// No longer offered by any form. The diagnostic branches used to render these
// fifteen headings above the panels, which put "Urinalysis" in two places at
// once and asked a laboratory to describe itself in words like "Blood Work"
// while the panel below wanted CBC and ESR. The panels replaced them, and the
// concepts these held alone — Histopathology, Cytology, Genetic Testing,
// COVID-19, STI Panel — moved into panels of their own under the same strings.
//
// Kept because service-groups.ts still groups by it: one facility stored nine
// of these values before the change, and dropping the list would scatter them
// into "Additional Services" on its public page. They surface in the editor as
// removable pills so an admin can replace them with panel selections.
export const LAB_TESTS = [
  "Blood Work",
  "Urinalysis",
  "Microbiology & Culture",
  "Histopathology",
  "Cytology",
  "Hormonal Assays",
  "Genetic Testing",
  "Immunology",
  "Toxicology",
  "COVID-19 Testing",
  "HIV Testing",
  "STI Panel",
  "TB Testing",
  "Malaria Testing",
  "Pregnancy Testing",
] as const;

export const SAMPLE_COLLECTION_OPTIONS = ["Walk-in only", "Home collection", "Both"] as const;

export const TURNAROUND_TIME_OPTIONS = [
  "Same day",
  "Next day",
  "2–3 days",
  "3–5 days",
  "1 week+",
] as const;

export const HOME_CARE_SERVICES = [
  "Nursing Care",
  "Wound Care",
  "IV Therapy",
  "Post-Surgical Care",
  "Physiotherapy",
  "Occupational Therapy",
  "Palliative Care",
  "Elderly Care",
  "Pediatric Care",
  "Mental Health Support",
  "Medication Management",
  "Health Monitoring",
  "Caregiver Support",
  "Doctor Home Visits",
  "Lab Sample Collection",
] as const;

export const MIN_VISIT_DURATION_OPTIONS = ["30 min", "1 hour", "2 hours", "Half day", "Full day"] as const;

export const BOOKING_LEAD_TIME_OPTIONS = ["Same day", "Next day", "2–3 days", "1 week"] as const;

export const AMBULANCE_VEHICLE_TYPES = [
  "Basic Life Support (BLS)",
  "Advanced Life Support (ALS)",
  "Neonatal Transport",
  "Bariatric Ambulance",
  "Air Ambulance",
  "Patient Transport (non-emergency)",
  "Wheelchair Van",
] as const;

export const RESPONSE_TIME_OPTIONS = [
  "Under 10 min",
  "10–20 min",
  "20–30 min",
  "30+ min",
  "Varies",
] as const;

// Facility types that show the default Step 3 view (general services,
// specialties, imaging, schedule, emergency, walk-in/appointment, check-up).
export const DEFAULT_STEP3_FACILITY_TYPES = ["General Hospital", "Specialty Center", "Clinic", "Other"] as const;

export const WORKING_DAYS_OPTIONS = [
  "Monday – Friday",
  "Monday – Saturday",
  "Monday – Sunday (7 days)",
  "Custom schedule",
] as const;

export const EMERGENCY_TYPES = [
  "24/7 emergency",
  "Daytime emergency only",
  "No emergency service",
] as const;

export const WALKIN_APPOINTMENT_OPTIONS = [
  "Walk-in only",
  "Appointment required",
  "Both walk-in and appointment",
  "Walk-in preferred, appointment available",
] as const;

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const TIME_OPTIONS = [
  "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM",
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM",
  "10:00 PM", "11:00 PM", "12:00 AM (midnight)",
  "Open 24 hours",
] as const;

// Completion scoring — given a facility_claims row, returns 0-100
export function calculateCompletion(claim: Record<string, unknown>): number {
  let pct = 0;

  // Step 1 (10%): name + category + (claim already has authorized confirmation)
  if (claim.proposed_name && claim.proposed_sub_city !== undefined) {
    if (claim.proposed_name) pct += 10;
  }

  // Step 2 (30%): sub_city + area + landmark + phone + (map pin OR maps link)
  const hasLocation =
    claim.proposed_sub_city &&
    claim.proposed_area &&
    claim.proposed_landmark;
  const hasContact = claim.proposed_phone;
  const hasMap =
    (claim.proposed_latitude && claim.proposed_longitude) ||
    claim.proposed_maps_link;
  if (hasLocation && hasContact && hasMap) pct += 30;

  // Step 3 (30%): main services + working hours (if collected) + walk-in/appointment (if collected)
  // Ambulance Service has no schedule builder (24/7 toggle instead), and
  // every facility type except the default group has no walk-in/appointment
  // selector — those sub-checks are skipped for types that don't collect them.
  const facilityType = claim.facility_type as string | undefined;
  const usesSchedule = facilityType !== "Ambulance Service";
  const usesWalkin = !facilityType || (DEFAULT_STEP3_FACILITY_TYPES as readonly string[]).includes(facilityType);
  const hasSchedule = !usesSchedule || claim.proposed_working_hours || claim.proposed_working_days;
  const hasServices =
    Array.isArray(claim.proposed_services) &&
    (claim.proposed_services as unknown[]).length > 0;
  const hasBooking = !usesWalkin || claim.proposed_walkin_appointment;
  if (hasSchedule && hasServices && hasBooking) pct += 30;

  // Step 4 (10%): doctors — optional, at least one named entry counts.
  // Pharmacies don't have a Doctors step at all (see
  // ProviderConsoleShell.tsx's FACILITY_TYPES_WITHOUT_DOCTORS_STEP) — same
  // "always earned" pattern as hasSchedule/hasBooking above, so skipping a
  // step that doesn't apply never blocks a pharmacy from reaching 100%.
  const usesDoctorsStep = facilityType !== "Pharmacy";
  const hasNamedDoctor =
    Array.isArray(claim.proposed_doctors) &&
    (claim.proposed_doctors as Array<Record<string, unknown>>).some(
      (doctor) => typeof doctor?.full_name === "string" && doctor.full_name.trim().length > 0,
    );
  if (!usesDoctorsStep || hasNamedDoctor) {
    pct += 10;
  }

  // Step 5 (15%): at least one photo
  const hasEntrancePhoto =
    claim.proposed_entrance_photo_url ||
    claim.proposed_photo_url ||
    (Array.isArray(claim.proposed_entrance_photo_urls) &&
      (claim.proposed_entrance_photo_urls as unknown[]).length > 0);
  if (hasEntrancePhoto) pct += 15;

  // Step 6 (5%): submission (status moves to pending_review)
  if (claim.status === "pending_review" || claim.status === "approved") pct += 5;

  return Math.min(pct, 100);
}
