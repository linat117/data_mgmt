## Database Table Structure

### Table: ClientRegistration

- **id**: UUID, primary key.
- **mentor_mother_name**: string, required.
- **date**: date, required.
- **total_green_cases**: integer, default 0.
- **total_blue_cases**: integer, default 0.
- **name**: string, required.
- **age**: integer, required.
- **sex**: string (M/F), required.
- **folder_number**: string, optional.
- **address**: text, required.
- **weight**: decimal(5,2), optional.
- **muac**: decimal(5,2), optional.
- **identified_problem**: text, required.
- **counseling_given**: text, required.
- **demonstration_shown**: text, optional.
- **anything_additional**: text, optional.
- **problem_faced_by_mm**: text, optional.
- **created_by**: FK to user, nullable.
- **created_at**: datetime.
- **updated_at**: datetime.

- **spss_start_date**: date, optional (SPSS `SDate`).
- **spss_first_name**: string, optional (SPSS `FName`).
- **spss_last_name**: string, optional (SPSS `LName`).
- **spss_marital_status_code**: integer, optional (SPSS `MStatus`).
- **spss_job**: string, optional (SPSS `Job`).
- **spss_payment**: integer, optional (SPSS `Payment`).
- **spss_number_child_deaths**: integer, optional (SPSS `NoCDeath`).
- **spss_number_children_sd**: integer, optional (SPSS `NoChildSD`).
- **spss_medical_record**: integer, optional (SPSS `MRecord`).
- **spss_pregnant_record**: integer, optional (SPSS `PLactate`).
- **spss_lactate**: integer, optional (SPSS `Lactate`).
- **spss_nutrition_status**: integer, optional (SPSS `Nutrisional`).
- **spss_starting_month**: string, optional (SPSS `SPmonth`).
- **spss_first_pv_date**: date, optional (SPSS `FristPVDate`).
- **spss_number_miscarriages**: integer, optional (SPSS `NoMiscarri`).
- **spss_immunization_count**: integer, optional (SPSS `Imunization`).
- **spss_delivery_status**: integer, optional (SPSS `DeliveryS`).
- **spss_delivery_date**: date, optional (SPSS `DeliveryD`).
- **spss_child_death_after**: integer, optional (SPSS `CDeathAFN`).
- **spss_breastfeeding_status**: integer, optional (SPSS `BreastF`).
- **spss_rh_factor**: integer, optional (SPSS `RHFactor`).
- **spss_no_antenatal**: integer, optional (SPSS `NoAntenat`).
- **spss_no_postnatal**: integer, optional (SPSS `NoPostnata`).
- **spss_child_no_after**: integer, optional (SPSS `ChildNOAF`).
- **spss_second_preg_date**: date, optional (SPSS `SDatePreg`).
- **spss_second_pregnancy**: integer, optional (SPSS `SPregnanc`).
- **spss_second_breastfeeding**: integer, optional (SPSS `SPBreastF`).
- **spss_second_antenatal**: integer, optional (SPSS `SAntenatal`).
- **spss_second_postnatal**: integer, optional (SPSS `SPostnatal`).
- **spss_second_immunization**: integer, optional (SPSS `SpImunizati`).
- **spss_second_delivery_date**: date, optional (SPSS `SPDeliveryD`).
- **spss_number_children_after**: integer, optional (SPSS `Nochildefte`).

