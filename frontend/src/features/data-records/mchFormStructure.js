/**
 * Maternal and Child Health Services Report – form structure (9 categories).
 * Each activity: { key, label, hasRemark }.
 */
export const MCH_CATEGORIES = [
  {
    no: 1,
    name: 'Counseling and Clinical Services',
    activities: [
      { key: 'counseling_sessions_pregnant_women', label: 'Counseling sessions for pregnant women', hasRemark: false },
      { key: 'trained_male_partners_pregnancy', label: 'Trained male partners to support their wives during pregnancy and delivery', hasRemark: true },
      { key: 'antenatal_clinic_admissions', label: 'Antenatal clinic admissions and treatments', hasRemark: false },
      { key: 'counseling_sessions_lactating_women', label: 'Counseling sessions for lactating women', hasRemark: false },
      { key: 'trained_male_partners_after_birth', label: 'Trained male partners to support their wives after birth', hasRemark: false },
      { key: 'clinic_admissions_children', label: 'Clinic admissions and treatment for children', hasRemark: false },
      { key: 'counseling_mothers_children_under_five', label: 'Counseling mothers (children under five health, nutrition, wellbeing)', hasRemark: true },
      { key: 'counseling_fathers_involvement', label: 'Counseling fathers (active male involvement in child health and family wellbeing)', hasRemark: true },
      { key: 'total_client_women', label: 'Total client women', hasRemark: false },
      { key: 'total_client_children_male', label: 'Total client children (Male)', hasRemark: false },
      { key: 'total_client_children_female', label: 'Total client children (Female)', hasRemark: false },
    ],
  },
  {
    no: 2,
    name: 'Nutrition and Rehabilitation',
    activities: [
      { key: 'mothers_rehabilitated_malnutrition', label: 'Mothers fully rehabilitated from malnutrition', hasRemark: false },
      { key: 'children_rehabilitated_malnutrition', label: 'Children fully rehabilitated from malnutrition', hasRemark: false },
      { key: 'children_referred_malnutrition', label: 'Children referred for malnutrition cases', hasRemark: false },
      { key: 'trained_food_demonstration', label: 'Trained on food demonstration (child nutrition, healthy feeding)', hasRemark: true },
    ],
  },
  {
    no: 3,
    name: 'Sanitation and Hygiene',
    activities: [
      { key: 'sanitation_hygiene_problems', label: 'No. sanitation and hygiene problems', hasRemark: false },
      { key: 'individuals_trained_sanitation_hygiene', label: 'No. individuals trained on sanitation and hygiene', hasRemark: true },
      { key: 'improved_sanitation_hygiene', label: 'No. improved sanitation and hygiene', hasRemark: false },
    ],
  },
  {
    no: 4,
    name: 'Gender-Based Violence (GBV)',
    activities: [
      { key: 'gbv_household', label: 'GBV cases reported in the household', hasRemark: false },
      { key: 'gbv_other_places', label: 'GBV cases reported in other places', hasRemark: false },
      { key: 'trauma_support_sessions_gbv', label: 'Trauma health support sessions for GBV survivors', hasRemark: true },
    ],
  },
  {
    no: 5,
    name: 'Referral Services',
    activities: [
      { key: 'anc_referrals_followup', label: 'ANC referrals for follow-up', hasRemark: false },
      { key: 'anc_referrals_other_medical', label: 'ANC referrals for other medical reasons', hasRemark: false },
      { key: 'anc_referrals_delivery', label: 'ANC referrals for delivery', hasRemark: false },
      { key: 'pnc_referrals_followup', label: 'PNC referrals for follow-up', hasRemark: false },
      { key: 'pnc_referrals_other_medical', label: 'PNC referrals for other medical reasons', hasRemark: false },
      { key: 'children_referred_health', label: 'Children referred for health issues', hasRemark: false },
    ],
  },
  {
    no: 6,
    name: 'Malnutrition Cases',
    activities: [
      { key: 'children_sam', label: 'Children with Severe Acute Malnutrition (SAM)', hasRemark: false },
      { key: 'children_mam', label: 'Children with Moderate Acute Malnutrition (MAM)', hasRemark: false },
      { key: 'children_mild_malnutrition', label: 'Children with mild malnutrition', hasRemark: false },
      { key: 'pregnant_women_malnutrition', label: 'Pregnant women with malnutrition', hasRemark: false },
      { key: 'lactating_women_malnutrition', label: 'Lactating women with malnutrition', hasRemark: false },
    ],
  },
  {
    no: 7,
    name: 'Breastfeeding Practices',
    activities: [
      { key: 'mothers_exclusive_breastfeeding', label: 'Mothers exclusively breastfeeding', hasRemark: false },
      { key: 'mothers_mixed_feeding', label: 'Mothers practicing mixed feeding', hasRemark: false },
    ],
  },
  {
    no: 8,
    name: 'HIV-Related Data',
    activities: [
      { key: 'hiv_positive_mothers', label: 'HIV-positive mothers', hasRemark: false },
      { key: 'hiv_mtct', label: 'HIV-positive transmissions from mother to child', hasRemark: false },
    ],
  },
  {
    no: 9,
    name: 'Income Generating Activities (IGA)',
    activities: [
      { key: 'iga_groups_formed', label: 'IGA groups formed', hasRemark: true },
    ],
  },
];

function getAllMetricKeys() {
  const keys = {};
  MCH_CATEGORIES.forEach((cat) => {
    cat.activities.forEach((a) => {
      keys[a.key] = 0;
      if (a.hasRemark) keys[`${a.key}_remark`] = '';
    });
  });
  return keys;
}

export function getInitialMCHMetrics() {
  return getAllMetricKeys();
}
