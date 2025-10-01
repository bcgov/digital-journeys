export const FORM_NAMES = {
  SL_REVIEW: 'SL review',
  SENIOR_LEADER_REVIEW: 'Senior Leadership Review Form',
  TELEWORK: 'Telework agreement',
  COMPLIANT_1_10:
    'Bullying / Misuse of Authority Complaint Form (Article 1.10)',
  INFLUENZA_WORKSITE_REGISTRATION: `${new Date().getFullYear()
    } Influenza Worksite Clinic Registration`,
  MATERNITY_AND_PARENTAL_LEAVE_FORM: 'Maternity and parental leave form',
  MATERNITY_PARENTAL_LEAVE_AND_ALLOWANCE_FORM:
    'Maternity, Parental Leave and Allowance form',
  COI: 'Conflict of Interest Disclosure',
  ERIP: 'Early Retirement Incentive Plan',
  LEADERSHIP_SURVEY: 'Senior Leadership Feedback Survey',
  SLFS_RESPONDENT_SELECTION: 'SLFS Respondent Selection'
};
/** 
 * please review "Form display name in draft and submission list" on below link
 * https://github.com/bcgov/digital-journeys/blob/main/docs/forms.md
 */

export const FORM_SUPPORTED_IDENTITY_PROVIDERS_FIELD_NAME =
  'formSupportedIdentityProviders';

// DGJ-2029 Array with list of forms to hide from Clients  
export const FORM_HIDDEN_LIST = (

  (window._env_ && window._env_.REACT_APP_FORM_HIDDEN_LIST) || process.env.REACT_APP_FORM_HIDDEN_LIST || ""

).split(",").map((form) => FORM_NAMES[form]).filter((form) => form && form != null);