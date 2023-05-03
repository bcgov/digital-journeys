export const TELEWORK_SUBMISSION = "TELEWORK_SUBMISSION";
export const TELEWORK_FINAL_SUBMISSION = "TELEWORK_FINAL_SUBMISSION";

export const SL_REVIEW_SUBMISSION = "SL_REVIEW_SUBMISSION";
export const SL_REVIEW_RESUBMISSION = "SL_REVIEW_RESUBMISSION";
export const SL_REVIEW_FINAL_SUBMISSION = "SL_REVIEW_FINAL_SUBMISSION";
export const COMPLAINT_INTAKE_FORM_1_10 = "1.10_COMPLAINT_INTAKE_FORM";
export const COMPLAINT_INTAKE_FORM_1_10_LDB = "1.10_COMPLAINT_INTAKE_FORM_LDB";
export const COMPLAINT_INTAKE_FORM_1_10_NOEMAIL = "1.10_COMPLAINT_INTAKE_FORM_NOEMAIL";
export const INFLUENZA_WORKSITE_REGISTRATION = "INFLUENZA_WORKSITE_REGISTRATION";

const submitSuccessPage = {
  seniorleadershipreview: SL_REVIEW_SUBMISSION,
  teleworkagreement: TELEWORK_SUBMISSION,
  "bullying-and-harassment-complaint-article-1-10": COMPLAINT_INTAKE_FORM_1_10,
  "bullying-and-harassment-complaint-article-1-10-ldb": COMPLAINT_INTAKE_FORM_1_10_LDB,
  "bullying-and-harassment-complaint-article-1-10-noemail": COMPLAINT_INTAKE_FORM_1_10_NOEMAIL,
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
    return redirectToSuccessPage(dispatch, push, submitSuccessPage[formKey]);
};

export const redirectToSuccessPage = (dispatch, push, pageKey) => {
    return dispatch(push(`/success?type=${pageKey}`));
};