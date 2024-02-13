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
  /** 
   * submissionDisplayName field will be add as hidden field. 
   * please review "Form display name in draft and submission list" on below link
   * https://github.com/bcgov/digital-journeys/blob/main/docs/forms.md
   */
  if (formData?.submissionDisplayName) {
    submitterName = formData?.submissionDisplayName;
  } else if (formNameLower.includes(FORM_NAMES.SENIOR_LEADER_REVIEW.toLowerCase())) {
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
    )
  ) {
    const firstName = formData?.primary_first_name || "";
    const lastName = formData?.primary_last_name || "";
    submitterName = `${firstName} ${lastName}`;
  }
  return submitterName ? submitterName.trim() : "";
};

function convertObjectKeyValueToLowercase(obj) {
  if (typeof obj !== 'object') {
    throw new Error('Input is not an object');
  }

  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      result[key.toLowerCase()] = value.map((item) =>
        typeof item === 'string' ? item.toLowerCase() : item
      );
    } else if (typeof value === 'string') {
      result[key.toLowerCase()] = value.toLowerCase();
    } else if (typeof value === 'object') {
      result[key.toLowerCase()] = convertObjectKeyValueToLowercase(value);
    } else {
      result[key.toLowerCase()] = value;
    }
  }

  return result;
}

export {
  replaceUrl,
  addTenankey,
  removeTenantKey,
  checkAndAddTenantKey,
  getEmployeeNameFromSubmission,
  convertObjectKeyValueToLowercase
};
