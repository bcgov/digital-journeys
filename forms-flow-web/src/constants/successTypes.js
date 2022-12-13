export const TELEWORK_SUBMISSION = "TELEWORK_SUBMISSION";
export const TELEWORK_FINAL_SUBMISSION = "TELEWORK_FINAL_SUBMISSION";

export const SL_REVIEW_SUBMISSION = "SL_REVIEW_SUBMISSION";
export const SL_REVIEW_RESUBMISSION = "SL_REVIEW_RESUBMISSION";
export const SL_REVIEW_FINAL_SUBMISSION = "SL_REVIEW_FINAL_SUBMISSION";
export const COMPLAINT_INTAKE_FORM_1_10 = "1.10_COMPLAINT_INTAKE_FORM";

let submitSuccessPage = {
  seniorleadershipreview: SL_REVIEW_SUBMISSION,
  teleworkagreement: TELEWORK_SUBMISSION,
  "bullying-and-harassment-complaint-article-1-10": COMPLAINT_INTAKE_FORM_1_10,
};

export const redirectToFormSuccessPage = (dispatch, push, formKey) => {
    return redirectToSuccessPage(dispatch, push, submitSuccessPage[formKey]);
};

export const redirectToSuccessPage = (dispatch, push, pageKey) => {
    return dispatch(push(`/success?type=${pageKey}`));
};