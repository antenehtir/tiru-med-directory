export const ONBOARDING_STEPS = [
  { num: 1, slug: "identity", label: "Basic Identity", weight: 10 },
  { num: 2, slug: "location", label: "Location & Contact", weight: 30 },
  { num: 3, slug: "services", label: "Services & Schedule", weight: 30 },
  { num: 4, slug: "doctors", label: "Doctors & Staff", weight: 10 },
  { num: 5, slug: "media", label: "Photos", weight: 15 },
  { num: 6, slug: "review", label: "Review & Submit", weight: 5 },
] as const;

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

// Steps 1+2+3 (10 + 30 + 30) sum to this — the threshold for Official badge eligibility

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

// Home visit, Travel medicine, Medical certificate and Blood bank were
// removed at a clinician's direction: they are things a facility does, not
// services a patient searches for, and each was carrying a line in a list
// every provider has to read. Three facilities and three pending claims hold
// them; 052 keeps those values visible and editable rather than orphaning
// them, the same way 051 handled Family Medicine.
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
  // Six facilities already advertise this and every one had to free-type it,
  // in four different spellings ("LAPAROSCOPY SURGERY", "Laparoscopic
  // Surgery", "Laparoscopic surgery", "Neuro-Vascular Laparoscopic Surgery").
  "Laparoscopic surgery",
  "Dialysis",
  "Dental procedure",
  "Eye care procedure",
  "Vaccination",
  "Chronic disease follow-up",
  "Executive / Comprehensive check-up",
  "Telemedicine consultation",
  "Laboratory service",
  "Imaging / Radiology",
  "Pharmacy service",
  "Ambulance service",
] as const;

// Ordered so a subspecialty sits directly under the parent a provider will
// have just ticked, rather than alphabetically or by when it was added: the
// list is read by someone scanning for their own department, and "Pediatric
// Nephrology" is found next to Pediatrics, not eighteen pills away next to
// Nephrology.
//
// The subspecialties here were not invented. Every one was typed by hand into
// "Add a service not listed" by a real provider — thirteen of them by Lancet
// General Hospital alone — which is the directory saying out loud that the
// checklist was too short. Spelling is normalised to the standard form on the
// way in ("Endocrine and brest surgery", "Cardiothoracic surgery"), and the
// rows that already hold the free-typed spellings are corrected by
// 048_normalise_specialty_names.sql so a provider is not shown the same
// specialty twice — once as a ticked pill and once as a removable chip.
//
// The compound entries stand alone: the solo "Gastroenterology" and
// "Pulmonology" were removed, because offering both the department and one of
// its halves on the same checklist reads as a duplicate and invites a provider
// to tick both. 051 migrates the rows — the nine and seven facilities holding
// a solo are moved onto the compound, which does assert a combined department
// for the five and three that only had the half. That is a deliberate call
// made with the numbers in hand, not an accident of the rename.
//
// Two of them are deliberately NOT split into halves. 048 turned
// "Pulmonology and critical care medicine" into a bare "Critical Care
// Medicine" and "Gastroenterology and Hepatology" into a bare "Hepatology",
// on the reasoning that the parent was already ticked. That was wrong: the
// provider wrote them as one department because that is what they are, and a
// checklist that offers the second half on its own asks a question no
// department answers. The compound name is now the only entry — see the note
// above for why the solo halves were later removed as well.
export const SPECIALTIES = [
  "Internal Medicine",
  "Pediatrics",
  "Pediatric Cardiology",
  "Pediatric Infectious Diseases",
  "Pediatric Nephrology",
  "Pediatric Neurology",
  "Pediatric Oncology",
  "Pediatric Surgery",
  "Obstetrics and Gynecology",
  "General Surgery",
  "Cardiothoracic Surgery",
  "Colorectal Surgery",
  "Endocrine and Breast Surgery",
  "Hepatobiliary Surgery",
  "Maxillofacial Surgery",
  "Orthopedic Surgery",
  "Plastic and Reconstructive Surgery",
  "Trauma Surgery",
  "Vascular Surgery",
  "Orthopedics",
  "Cardiology",
  "Gastroenterology and Hepatology",
  "Neurology",
  "Neurosurgery",
  "Psychiatry",
  "Dermatology",
  "ENT",
  "Ophthalmology",
  "Dental",
  "Urology",
  "Nephrology",
  "Pulmonology and Critical Care Medicine",
  "Endocrinology",
  "Rheumatology",
  "Infectious Diseases",
  "Oncology",
  "Hematology",
  "Anesthesiology",
  "Radiology",
  "Pathology",
  "Emergency Medicine",
  "Physiotherapy",
  "Nutrition and Dietetics",
  "Psychology / Counseling",
  "Speech and Language Therapy",
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

// Ordered by how a radiology department is organised — plain film, contrast
// studies, cross-sectional, nuclear, cardiac, neuro and respiratory,
// endoscopy, then the rest — rather than by when each entry was added. The
// public page renders services in this order too, so the order is what a
// reader sees.
//
// Everything below the original twenty was found in the live data, not
// invented: each was free-typed by at least one facility because this list had
// nowhere to put it.
//
// Trimmed back once the list was in front of a clinician. Seven entries came
// out — IVP, CUG, Thyroid Scintigraphy, SPECT-CT, TOE, Cerebral Angiography
// and Teleradiology Reporting — because no facility and no pending claim had
// ticked a single one of them, and a checklist that offers procedures nobody
// in Addis performs makes the ones that matter harder to find. Measured before
// removing: all seven were at zero. The free-typed spellings that originally
// motivated them are still in the data and still searchable; they simply no
// longer take a line each in a list every provider has to read.
export const IMAGING_SERVICES = [
  "X-Ray",
  "Ultrasound",
  "CT Scan",
  "MRI",
  "Mammography",
  "Fluoroscopy",
  // Contrast and fluoroscopic studies. Spelt out alongside the abbreviation
  // because a patient holding a referral reads one and a radiographer says the
  // other.
  "HSG (Hysterosalpingography)",
  "Barium Studies",
  "DEXA Scan",
  "PET Scan",
  "Nuclear Medicine",
  "Echocardiography",
  // Separate entries rather than one "Echocardiography": a clinic that scans
  // a fetus is not thereby a cardiac centre, and a mother sent for a fetal
  // echo needs to know which facilities actually do that one.
  "Fetal Echocardiography",
  "Paediatric Echocardiography",
  "ECG / EKG",
  "EEG",
  "Spirometry",
  "Endoscopy",
  "Colonoscopy",
  "Bronchoscopy",
  "Colposcopy",
  "Doppler Ultrasound",
  "Transient Elastography (FibroScan)",
  "Bone Marrow Biopsy",
  "Interventional Radiology",
  "Coronary Angiography",
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

// ═══════════════════════════════════════════════════════════════════════════
// What a listing must have before it can be published.
//
// This replaced a "70% complete" threshold. A percentage is not something a
// provider can act on: it is a weighted sum across six steps, so two listings
// missing entirely different things score identically and the error message
// could not say which. It also gated the wrong thing — a hospital could reach
// 70% on photos and doctor entries while carrying no coordinates, and a
// directory whose whole job is helping someone find a place would have
// published it.
//
// Every field here is one the public site cannot work without. Photos, logos,
// doctors, landmarks and opening hours are deliberately NOT here: they make a
// listing better, not usable, and the incentive for those belongs in Step 6's
// guidance rather than in a barrier.
//
// Shared by submitForReview (the server-side gate, which is the one that
// counts) and Step6ReviewForm (which tells the provider the same thing before
// they press the button), so the two cannot disagree.
// ═══════════════════════════════════════════════════════════════════════════
export const REQUIRED_FIELD_LABELS = {
  name: "facility name",
  category: "facility type",
  phone: "phone number",
  subCity: "sub-city",
  area: "area or neighbourhood",
  coordinates: "map location",
  services: "at least one service",
} as const;

export type RequiredFieldKey = keyof typeof REQUIRED_FIELD_LABELS;

// Which required fields a claim is still missing, in the order a provider
// filled the form in, so the message reads like a walk back through the steps.
export function missingRequiredFieldKeys(claim: Record<string, unknown>): RequiredFieldKey[] {
  const missing: RequiredFieldKey[] = [];

  if (!String(claim.proposed_name ?? "").trim()) missing.push("name");
  // facility_type is the column onboarding writes; proposed_category_data is
  // the sub-selection under it and does not stand in for the type itself.
  if (!String(claim.facility_type ?? "").trim()) missing.push("category");
  if (!String(claim.proposed_phone ?? "").trim()) missing.push("phone");
  if (!String(claim.proposed_sub_city ?? "").trim()) missing.push("subCity");
  if (!String(claim.proposed_area ?? "").trim()) missing.push("area");

  // Coordinates, not "coordinates OR a maps link". A link is a promise that
  // the pin can be found later; Nearby, distance sorting and the compare rail
  // all need the numbers now, and an unresolved link leaves the facility
  // invisible to every one of them.
  if (claim.proposed_latitude == null || claim.proposed_longitude == null) {
    missing.push("coordinates");
  }

  const services = claim.proposed_services;
  if (!Array.isArray(services) || services.length === 0) missing.push("services");

  return missing;
}

export function missingRequiredFields(claim: Record<string, unknown>): string[] {
  return missingRequiredFieldKeys(claim).map((key) => REQUIRED_FIELD_LABELS[key]);
}
