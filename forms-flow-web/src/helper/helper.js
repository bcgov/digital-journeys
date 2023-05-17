import { FORM_NAMES } from "../constants/formConstants";

const replaceUrl = (URL, key, value) => {
  return URL.replace(key, value);
};

const addTenankey = (value, tenankey) => {
  let newValue = value.split("-");
  let tenantId = newValue.shift();
  if (tenankey.toLowerCase() === tenantId.toLowerCase()) {
    return value.toLowerCase();
  } else {
    return `${tenankey.toLowerCase()}-${value.toLowerCase()}`;
  }
};

const removeTenantKey = (value, tenankey) => {
  let newValue = value.split("-");
  let tenantId = newValue.shift();
  if (tenankey.toLowerCase() === tenantId.toLowerCase()) {
    return newValue.join("-");
  } else {
    return false;
  }
};

const checkAndAddTenantKey = (value, tenankey) => {
  let newValue = value.split("-");
  let tenantId = newValue.shift();
  if (tenankey.toLowerCase() === tenantId.toLowerCase()) {
    return value;
  } else {
    return `${tenankey.toLowerCase()}-${value.toLowerCase()}`;
  }
};

const getEmployeeNameFromSubmission = (form, submission) => {
  if (!submission?.data) return "";
  const formData = submission.data;

  let submitterName = "";
  const formNameLower = form.toLowerCase();

  if (formNameLower.includes(FORM_NAMES.SENIOR_LEADER_REVIEW.toLowerCase())) {
    submitterName = formData?.employeeName?.name || formData?.employeeName;
  } else if (formNameLower.includes(FORM_NAMES.TELEWORK.toLowerCase())) {
    submitterName = formData?.name;
  } else if (formNameLower.includes(FORM_NAMES.COMPLIANT_1_10.toLowerCase())) {
    if (formData?.firstName && formData?.lastName) {
      submitterName = `${formData.firstName} ${formData.lastName}`;
    } else if (formData?.legalNameFirstName && formData?.legalNameLastName) {
      submitterName = `${formData.legalNameFirstName} ${formData.legalNameLastName}`;
    }
  } else if (
    formNameLower.includes(
      FORM_NAMES.INFLUENZA_WORKSITE_REGISTRATION.toLowerCase()
    ) || formNameLower.includes(
      FORM_NAMES.INFLUENZA_CLINIC_WORKSITE_REGISTRATION.toLowerCase()
    )
  ) {
    const firstName = formData?.primary_first_name || "";
    const lastName = formData?.primary_last_name || "";
    submitterName = `${firstName} ${lastName}`.replace(/''/g, "'");
  }
  return submitterName ? submitterName.trim() : "";
};

export {
  replaceUrl,
  addTenankey,
  removeTenantKey,
  checkAndAddTenantKey,
  getEmployeeNameFromSubmission,
};
