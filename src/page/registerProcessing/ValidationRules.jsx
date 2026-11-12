import React, { useState } from "react";
import "../../style/validationRules.css";
const validationData = {
  name: "Validation_Logic",
  rules: [
    { id: "VL_001", description: "employee_id is blank/null OR invalid format" },
    { id: "VL_002", description: "employee_name is blank/null OR invalid format" },
    { id: "VL_003", description: "establishment_code is blank/null OR invalid format" },
    { id: "VL_004", description: "work_state is blank/null OR invalid format" },
    { id: "VL_005", description: "date_of_joining is blank/null OR invalid format" },
    { id: "VL_006", description: "gender is blank/null OR invalid format" },
    { id: "VL_007", description: "father_spouse_name is blank/null OR invalid format" },
    { id: "VL_008", description: "designation is blank/null OR invalid format" },
    { id: "VL_009", description: "department is blank/null OR invalid format" },
    { id: "VL_010", description: "pan is blank/null OR invalid format" },
    { id: "VL_011", description: "uan is blank/null OR invalid format" },
    { id: "VL_012", description: "esi_ip_number is blank/null OR invalid format" },
    { id: "VL_013", description: "bank_account is blank/null OR invalid format" },
    { id: "VL_014", description: "mobile is blank/null OR invalid format" },
    { id: "VL_015", description: "same pan appears for multiple active employees" },
    { id: "VL_016", description: "same uan appears for multiple active employees" },
    { id: "VL_017", description: "same esi_ip_number appears for multiple active employees" },
    { id: "VL_018", description: "same bank_account appears for multiple active employees" },
    { id: "VL_019", description: "date_of_exit is present AND date_of_exit < date_of_joining" },
    { id: "VL_020", description: "dob is present AND dob indicates employee is below configured minimum age at DOJ" },
    { id: "VL_021", description: "no mapping profile exists for uploaded file type" },
    { id: "VL_022", description: "synonym dictionary missing for common headers" },
    { id: "VL_023", description: "rows_loaded is zero for a required dataset (earnings/attendance)" },
    { id: "VL_024", description: "input headers contain many merged/blank columns leading to misreads" },
    { id: "VL_025", description: "ocr_flag = TRUE for statutory-critical file" },
    { id: "VL_026", description: "gross_earnings < 0" },
    { id: "VL_027", description: "net_pay != gross_earnings - total_deductions (tolerance)" },
    { id: "VL_028", description: "total_deductions < 0" },
    { id: "VL_029", description: "paid_days < 0 OR paid_days > days_in_month" },
    { id: "VL_030", description: "lop_days < 0 OR lop_days > days_in_month" },
    { id: "VL_031", description: "paid_days + lop_days > days_in_month" },
    { id: "VL_032", description: "net_pay < 0" },
    { id: "VL_033", description: "arrears_amount is high but no arrears_period/reference provided" },
    { id: "VL_034", description: "advance recovery exists but advance_reference missing" },
    { id: "VL_035", description: "total_deductions > gross_earnings" },
    { id: "VL_036", description: "basic amount exists but salary head not mapped in Component Mapping Master" },
    { id: "VL_037", description: "da amount exists but salary head not mapped in Component Mapping Master" },
    { id: "VL_038", description: "hra amount exists but salary head not mapped in Component Mapping Master" },
    { id: "VL_039", description: "special_allowance amount exists but salary head not mapped in Component Mapping Master" },
    { id: "VL_040", description: "conveyance_allowance amount exists but salary head not mapped in Component Mapping Master" },
    { id: "VL_041", description: "medical_allowance amount exists but salary head not mapped in Component Mapping Master" },
    { id: "VL_042", description: "other_allowance amount exists but salary head not mapped in Component Mapping Master" },
    { id: "VL_043", description: "date_of_payment is blank/null" },
    { id: "VL_044", description: "date_of_payment later than configured due day (Policy Master)" },
    { id: "VL_045", description: "payment_mode missing" },
    { id: "VL_046", description: "payment_mode = Bank AND bank_account missing" },
    { id: "VL_047", description: "payment_mode = Cash for large headcount (risk flag)" },
    { id: "VL_048", description: "Daily attendance columns missing for the month" },
    { id: "VL_049", description: "paid_days != present + leave + holiday + weekly_off (tolerance)" },
    { id: "VL_050", description: "weekly_off_days = 0 AND present_days close to days_in_month" },
    { id: "VL_051", description: "holiday_days = 0 for a site with configured holiday calendar" },
    { id: "VL_052", description: "ot_hours high but present_days low (suspicious)" },
    { id: "VL_053", description: "night shift allowance paid but shift_code missing" },
    { id: "VL_054", description: "pf deducted but pf_wage_base missing OR pf_wage_base present but pf deduction missing" },
    { id: "VL_055", description: "pf_employee_deduction > 0 AND uan missing" },
    { id: "VL_056", description: "uan not 12-digit numeric" },
    { id: "VL_057", description: "pf_employee_deduction != round(pf_wage_base * pf_emp_rate) (tolerance)" },
    { id: "VL_058", description: "pf_employer_contribution != round(pf_wage_base * pf_er_rate) (tolerance)" },
    { id: "VL_059", description: "basic/gross < configured threshold AND regular allowances exist" },
    { id: "VL_060", description: "pf_wage_base equals basic while allowances_total high and regular" },
    { id: "VL_061", description: "pf_wage_base unchanged across months despite paid_days variation (risk)" },
    { id: "VL_062", description: "pf_applicability_flag=Yes but pf_employee_deduction=0 for covered employees" },
    { id: "VL_063", description: "pf_employee_deduction < 0" },
    { id: "VL_064", description: "esi deducted but esi_wage_base missing OR base present but deduction missing" },
    { id: "VL_065", description: "esi_employee_deduction > 0 AND esi_ip_number missing" },
    { id: "VL_066", description: "esi_employee_deduction != round(esi_wage_base * esi_emp_rate) (tolerance)" },
    { id: "VL_067", description: "esi_employer_contribution != round(esi_wage_base * esi_er_rate) (tolerance)" },
    { id: "VL_068", description: "gross_earnings <= esi_ceiling AND esi deduction = 0 (and not excluded)" },
    { id: "VL_069", description: "gross_earnings > esi_ceiling AND esi deduction > 0" },
    { id: "VL_070", description: "esi base excludes heads marked includible OR includes heads marked excludable (mapping conflict)" },
    { id: "VL_071", description: "PT applicable but work_state missing" },
    { id: "VL_072", description: "pt_deduction != pt slab as per PT master (state/period)" },
    { id: "VL_073", description: "pt_deduction < 0" },
    { id: "VL_074", description: "lwf deduction exists but LWF master not configured for state" },
    { id: "VL_075", description: "lwf deducted in a month not due per master" },
    { id: "VL_076", description: "lwf_deduction != lwf slab as per master" },
    { id: "VL_077", description: "designation present but MW skill mapping missing for state/location" },
    { id: "VL_078", description: "state requires zone but employee/site zone missing" },
    { id: "VL_079", description: "mw_wage_base < applicable MW rate (prorated by paid days if needed)" },
    { id: "VL_080", description: "many employees fall into 'Unmapped' or 'Review' category" },
    { id: "VL_081", description: "MW master has no active rate for the period" },
    { id: "VL_082", description: "leave policy grade/star missing" },
    { id: "VL_083", description: "leave_balance_closing < 0" },
    { id: "VL_084", description: "leave_earned != configured accrual for grade/star (tolerance)" },
    { id: "VL_085", description: "leave encashment paid but neither exit date nor annual flag present" },
    { id: "VL_086", description: "leave encashment paid in multiple consecutive months for same employee" },
    { id: "VL_087", description: "leave_encashment_days > available leave balance" },
    { id: "VL_088", description: "bonus paid as monthly fixed component for most employees" },
    { id: "VL_089", description: "bonus_applicable_flag=Yes but bonus_paid missing/zero for eligible employees (annual run)" },
    { id: "VL_090", description: "ot_hours present but ot_amount missing OR vice versa" },
    { id: "VL_091", description: "ot_amount inconsistent with expected multiplier (Policy Master)" },
    { id: "VL_092", description: "date_of_exit present but payroll continues beyond exit date" },
    { id: "VL_093", description: "date_of_exit present but FnF status missing" },
    { id: "VL_094", description: "notice pay recovery exists but notice period fields missing" },
    { id: "VL_095", description: "scenario=Contractor but contractor_id missing" },
    { id: "VL_096", description: "scenario=Contractor but principal employer site code missing" },
    { id: "VL_097", description: "one or more required fields missing: employee_id, employee_name, establishment_code" },
    { id: "VL_098", description: "one or more required fields missing: paid_days, gross_earnings, net_pay" },
    { id: "VL_099", description: "one or more required fields missing: date_of_payment" },
    { id: "VL_100", description: "large share of employees have basic exactly at a low fixed band with high allowances (pattern)" },
    { id: "VL_101", description: "many employees hover around ESI ceiling with frequent on/off deductions (pattern)" },
    { id: "VL_102", description: "paid_days changes but net pay unchanged for many employees (pattern)" }
  ]
};

export default function ValidationRules() {
  // Every rule starts validated; the reset/validate-all buttons below are commented out
  const [validatedRules] = useState(
    new Set(validationData.rules.map(r => r.id))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");


  const filteredRules = validationData.rules.filter((rule) => {
    const matchesSearch = rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === "all") return matchesSearch;
    if (filterType === "validated") return matchesSearch && validatedRules.has(rule.id);
    if (filterType === "pending") return matchesSearch && !validatedRules.has(rule.id);
    return matchesSearch;
  });

  const totalCount = validationData.rules.length;

  return (
    <div className="validation-container">
      <div className="validation-header">
        <h1>Validation Rules</h1>
        <div className="validation-progress">
          <div className="progress-info">
            <span className="progress-label">Progress</span>
            <span className="progress-value">{102} of {102}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${100}%` }}></div>
          </div>
          <span className="progress-percentage">{100}%</span>
        </div>
      </div>

      <div className="validation-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search validation rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All ({totalCount})
          </button>
          <button
            className={`filter-btn ${filterType === "validated" ? "active" : ""}`}
            onClick={() => setFilterType("validated")}
          >
            {/* Validated ({validatedCount}) */}
            Validated ({102})
          </button>
          <button
            className={`filter-btn ${filterType === "pending" ? "active" : ""}`}
            onClick={() => setFilterType("pending")}
          >
            {/* Pending ({totalCount - validatedCount}) */}
            Pending ({0})

          </button>
        </div>
      </div>

      <div className="validation-rules-list">
        {filteredRules.length === 0 ? (
          <div className="no-results">
            <p>No validation rules found</p>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={`validation-rule ${validatedRules.has(rule.id) ? "validated" : "validated"}`}
            //   onClick={() => toggleValidation(rule.id)}
            >
              <div className="rule-checkbox">
                <input
                  type="checkbox"
                  checked={true} // Always checked to indicate clickability
                //   onChange={() => toggleValidation(rule.id)}
                  className="checkbox-input"
                />
                <span className="checkmark"></span>
              </div>

              <div className="rule-content">
                <p className="rule-description">{rule.description}</p>
              </div>

              <div className="rule-status">
                {validatedRules.has(rule.id) && (
                  <span className="validated-badge">Validated</span>
                 )} 
              </div>
            </div>
          ))
        )}
      </div>

      {/* <div className="validation-footer">
        <button className="reset-btn" onClick={() => setValidatedRules(new Set())}>
          Reset All
        </button>
        <button className="validate-all-btn" onClick={() => {
          const allIds = new Set(validationData.rules.map(r => r.id));
          setValidatedRules(allIds);
        }}>
          Validate All
        </button>
      </div> */}
    </div>
  );
}
