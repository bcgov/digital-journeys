export const TELEWORK_SUBMISSION = "TELEWORK_SUBMISSION";
export const TELEWORK_FINAL_SUBMISSION = "TELEWORK_FINAL_SUBMISSION";

export const SL_REVIEW_SUBMISSION = "SL_REVIEW_SUBMISSION";
export const SL_REVIEW_RESUBMISSION = "SL_REVIEW_RESUBMISSION";
export const SL_REVIEW_FINAL_SUBMISSION = "SL_REVIEW_FINAL_SUBMISSION";
export const COMPLAINT_INTAKE_FORM_1_10 = "1.10_COMPLAINT_INTAKE_FORM";
export const COMPLAINT_INTAKE_FORM_1_10_LDB = "1.10_COMPLAINT_INTAKE_FORM_LDB";
export const COMPLAINT_INTAKE_FORM_1_10_NOEMAIL = "1.10_COMPLAINT_INTAKE_FORM_NOEMAIL";
export const INFLUENZA_WORKSITE_REGISTRATION = "INFLUENZA_WORKSITE_REGISTRATION";
export const INFLUENZA_WORKSITE_REGISTRATION_EDIT = "INFLUENZA_WORKSITE_REGISTRATION_EDIT";
export const MATERNITY_AND_PARENTAL_LEAVE_FORM = "MATERNITY_AND_PARENTAL_LEAVE_FORM";
export const MATERNITY_AND_PARENTAL_LEAVE_FORM_INELIGIBLE = "MATERNITY_AND_PARENTAL_LEAVE_FORM_INELIGIBLE";
export const MATERNITY_AND_PARENTAL_LEAVE_FORM_APPROVED = "MATERNITY_AND_PARENTAL_LEAVE_FORM_APPROVED";
export const MATERNITY_AND_PARENTAL_LEAVE_FORM_DENIED = "MATERNITY_AND_PARENTAL_LEAVE_FORM_DENIED";
export const DELETE_TELEWORK = "DELETE_TELEWORK";


const submitSuccessPage = {
  seniorleadershipreview: SL_REVIEW_SUBMISSION,
  teleworkagreement: TELEWORK_SUBMISSION,
  "bullying-and-harassment-complaint-article-1-10": COMPLAINT_INTAKE_FORM_1_10,
  "bullying-and-harassment-complaint-article-1-10-ldb": COMPLAINT_INTAKE_FORM_1_10_LDB,
  "bullying-and-harassment-complaint-article-1-10-noemail": COMPLAINT_INTAKE_FORM_1_10_NOEMAIL,
  "2023influenzaworksiteregistration": INFLUENZA_WORKSITE_REGISTRATION,
  "maternity-parental-leave-and-allowance": MATERNITY_AND_PARENTAL_LEAVE_FORM,
  "maternity-parental-leave-and-allowance-ineligible": MATERNITY_AND_PARENTAL_LEAVE_FORM_INELIGIBLE,
};

export const redirectToFormSuccessPage = (dispatch, push, formKey, submission) => {
  if (formKey === "bullying-and-harassment-complaint-article-1-10") {
    if (submission?.data?.pleaseSelectTheUnionYouBelongTo === "bcGeneralEmployeesUnionBcgeu"
      && submission?.data?.areYouAnEmployeeOfTheLiquorDistributionBoardLdb === "yes") {
      if (submission?.data?.yourPreferredEmailAddress.includes('gov.bc.ca') ||
        submission?.data?.yourPreferredEmailAddress.includes('bcldb.com')) {
        formKey = `${formKey}-ldb`;
      } else {
        formKey = `${formKey}-noemail`;
      }
    }
  }
  if (formKey === "maternity-parental-leave-and-allowance") {
    if (submission?.data?.empCtg === "K" || submission?.data?.empCtg === "L") {
      formKey = `${formKey}-ineligible`;
    }
  }

  return redirectToSuccessPage(dispatch, push, submitSuccessPage[formKey]);
};

export const redirectToSuccessPage = (dispatch, push, pageKey) => {
  return dispatch(push(`/success?type=${pageKey}`));
};