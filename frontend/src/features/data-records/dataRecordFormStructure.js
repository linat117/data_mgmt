/**
 * Data Record Form structure per the provided schema (image spec).
 * Variables 1–24: first block; 25–35: second pregnancy block.
 * Coded fields use value labels (dropdowns).
 */

export const DATA_RECORD_SECTIONS = [
  {
    title: 'Basic & registration',
    fields: [
      { key: 'spss_start_date', label: 'Started Date', type: 'date' },
      { key: 'spss_first_name', label: 'First Name', type: 'string' },
      { key: 'spss_last_name', label: 'Last Name', type: 'string' },
      { key: 'age', label: 'Client Age', type: 'number' },
      { key: 'folder_number', label: 'Folder Number', type: 'string' },
      { key: 'address', label: 'Address', type: 'string' },
      { key: 'spss_marital_status_code', label: 'Marital Status', type: 'select', options: 'MARITAL_STATUS' },
      { key: 'spss_job', label: 'Client job', type: 'select', options: 'JOB', storeAs: 'string' },
      { key: 'spss_payment', label: 'Client Payment', type: 'number', step: 0.01 },
      { key: 'spss_number_child_deaths', label: 'Number of Child Death', type: 'number' },
      { key: 'spss_number_children_sd', label: 'Number of child starting day', type: 'number' },
      { key: 'spss_medical_record', label: 'Medical Record', type: 'select', options: 'MEDICAL_RECORD' },
      { key: 'spss_pregnant_record', label: 'Pregnant Lactate', type: 'select', options: 'PREGNANT_LACTATE' },
      { key: 'spss_lactate', label: 'Lactate', type: 'select', options: 'LACTATE' },
      { key: 'spss_nutrition_status', label: 'Nutritional status', type: 'select', options: 'NUTRITIONAL_STATUS' },
      { key: 'spss_starting_month', label: 'Starting Pregnancy Month', type: 'string' },
      { key: 'spss_first_pv_date', label: 'First pregnancy visited Date', type: 'date' },
      { key: 'spss_number_miscarriages', label: 'Number of Miscarriage', type: 'number' },
      { key: 'spss_immunization_count', label: 'Immunization Taken', type: 'select', options: 'IMMUNIZATION' },
      { key: 'spss_delivery_status', label: 'Delivery Story', type: 'select', options: 'DELIVERY_STORY' },
      { key: 'spss_delivery_date', label: 'Delivery Date', type: 'date' },
      { key: 'spss_child_death_after', label: 'Child death after first Delivery', type: 'number' },
      { key: 'spss_breastfeeding_status', label: 'Breast Feeding', type: 'select', options: 'BREAST_FEEDING' },
      { key: 'spss_rh_factor', label: 'RH Factor', type: 'select', options: 'RH_FACTOR' },
    ],
  },
  {
    title: 'After first pregnancy',
    fields: [
      { key: 'spss_no_antenatal', label: 'Number Antenatal Care', type: 'number' },
      { key: 'spss_no_postnatal', label: 'Number Postnatal Care', type: 'number' },
      { key: 'spss_child_no_after', label: 'Child Number after first pregnancy', type: 'number' },
    ],
  },
  {
    title: 'Second pregnancy',
    fields: [
      { key: 'spss_second_preg_date', label: 'Second Date of pregnancy', type: 'date' },
      { key: 'spss_second_pregnancy', label: 'Second Pregnancy Delivery', type: 'select', options: 'DELIVERY_STORY' },
      { key: 'spss_second_breastfeeding', label: 'Second Pregnancy Breast Feeding', type: 'select', options: 'BREAST_FEEDING' },
      { key: 'spss_second_antenatal', label: 'Second Antenatal Care', type: 'number' },
      { key: 'spss_second_postnatal', label: 'Second postnatal Care', type: 'number' },
      { key: 'spss_second_immunization', label: 'Second pregnancy Immunization', type: 'select', options: 'IMMUNIZATION' },
      { key: 'spss_second_delivery_date', label: 'Second Pregnancy Delivery Date', type: 'date' },
      { key: 'spss_number_children_after', label: 'Number of child after second pregnancy', type: 'number' },
    ],
  },
  {
    title: 'Third pregnancy',
    fields: [
      { key: 'spss_third_preg_date', label: 'Third Date of pregnancy', type: 'date' },
      { key: 'spss_third_pregnancy', label: 'Third Pregnancy Delivery', type: 'select', options: 'DELIVERY_STORY' },
      { key: 'spss_third_breastfeeding', label: 'Third Pregnancy Breast Feeding', type: 'select', options: 'BREAST_FEEDING' },
      { key: 'spss_third_antenatal', label: 'Third Antenatal Care', type: 'number' },
      { key: 'spss_third_postnatal', label: 'Third postnatal Care', type: 'number' },
      { key: 'spss_third_immunization', label: 'Third pregnancy Immunization', type: 'select', options: 'IMMUNIZATION' },
      { key: 'spss_third_delivery_date', label: 'Third Pregnancy Delivery Date', type: 'date' },
      { key: 'spss_third_number_children_after', label: 'Number of child after third pregnancy', type: 'number' },
    ],
  },
];

/** Value labels for coded fields (dropdown options). Code is stored in DB. */
export const VALUE_LABELS = {
  MARITAL_STATUS: [
    { value: 1, label: 'Married' },
    { value: 2, label: 'Single' },
    { value: 3, label: 'Divorced' },
    { value: 4, label: 'Widowed' },
    { value: 5, label: 'Other' },
  ],
  JOB: [
    { value: 1, label: 'House wife' },
    { value: 2, label: 'Farmer' },
    { value: 3, label: 'Trader' },
    { value: 4, label: 'Employed' },
    { value: 5, label: 'Daily labour' },
    { value: 6, label: 'Other' },
  ],
  MEDICAL_RECORD: [
    { value: 1, label: 'Diabetic' },
    { value: 2, label: 'Hypertensive' },
    { value: 3, label: 'HIV positive' },
    { value: 4, label: 'TB' },
    { value: 5, label: 'Anaemia' },
    { value: 6, label: 'None' },
    { value: 7, label: 'Other' },
    { value: 8, label: 'Multiple / Other condition' },
  ],
  PREGNANT_LACTATE: [
    { value: 1, label: 'Pregnant' },
    { value: 2, label: 'Lactating' },
    { value: 3, label: 'Neither' },
  ],
  LACTATE: [
    { value: 1, label: 'Exclusive' },
    { value: 2, label: 'Mixed' },
    { value: 3, label: 'Not breastfeeding' },
    { value: 4, label: 'Other' },
  ],
  NUTRITIONAL_STATUS: [
    { value: 1, label: 'Severe malnourished' },
    { value: 2, label: 'Moderate malnourished' },
    { value: 3, label: 'Mild malnourished' },
    { value: 4, label: 'Normal' },
    { value: 5, label: 'Other' },
  ],
  IMMUNIZATION: [
    { value: 1, label: 'TT1' },
    { value: 2, label: 'TT2' },
    { value: 3, label: 'TT3' },
    { value: 4, label: 'TT4+' },
    { value: 5, label: 'None' },
  ],
  DELIVERY_STORY: [
    { value: 1, label: 'Hospital' },
    { value: 2, label: 'Health center' },
    { value: 3, label: 'Home' },
    { value: 4, label: 'Other' },
  ],
  BREAST_FEEDING: [
    { value: 1, label: 'Exclusive' },
    { value: 2, label: 'Mixed' },
    { value: 3, label: 'Not breastfeeding' },
    { value: 4, label: 'Other' },
  ],
  RH_FACTOR: [
    { value: 1, label: 'Positive' },
    { value: 2, label: 'Negative' },
  ],
};

/** All data-record field keys (for initial state and payload). */
export function getDataRecordKeys() {
  const keys = ['mentor_mother_name', 'date', 'total_green_cases', 'total_blue_cases', 'name', 'sex'];
  DATA_RECORD_SECTIONS.forEach((section) => {
    section.fields.forEach((f) => {
      if (f.key && !keys.includes(f.key)) keys.push(f.key);
    });
  });
  return keys;
}

/** Get display label for a coded value (e.g. 1 -> "Married"). */
export function getLabelForValue(optionKey, value) {
  if (value === '' || value === null || value === undefined) return '';
  const opts = VALUE_LABELS[optionKey];
  if (!opts) return String(value);
  const v = typeof value === 'string' ? parseInt(value, 10) : value;
  const found = opts.find((o) => o.value === v);
  return found ? found.label : String(value);
}
