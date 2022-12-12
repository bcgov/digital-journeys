import { FORM_NAMES } from "../constants/formConstants";
import startCase from "lodash/startCase";

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
  if (submission === undefined) {
    return '';
  }
  let employee = "";
  if (
    startCase(form).toLowerCase()
    .includes(startCase(FORM_NAMES.slreview).toLowerCase()) ||
    startCase(form).toLowerCase()
    .includes(startCase(FORM_NAMES.srleadershipreview).toLowerCase())) {
    employee = submission?.data?.employeeName?.name === undefined ?
    submission?.data?.employeeName : submission?.data?.employeeName?.name;
    employee = employee === "" ? undefined : employee;
  } else if (
    startCase(form).toLowerCase()
    .includes(startCase(FORM_NAMES.teleworkagreement).toLowerCase())) {
    employee = submission?.data?.name;
    employee = employee === "" ? undefined : employee;
  } else if (
    startCase(form).toLowerCase()
    .includes(startCase(FORM_NAMES.complaintintakeform).toLowerCase())
    || startCase(form).toLowerCase()
    .includes(startCase(FORM_NAMES.complaintform).toLowerCase())) {
    if (submission?.data?.firstName !== undefined && 
      submission?.data?.lastName !== undefined) {
        employee = `${submission?.data?.firstName} ${submission?.data?.lastName}`;
        employee = employee.trim() === "" ? undefined : employee;
    } else if (submission?.data?.legalNameFirstName !== undefined && 
      submission?.data?.legalNameLastName !== undefined) {
        employee = `${submission?.data?.legalNameFirstName} ${submission?.data?.legalNameLastName}`;
        employee = employee.trim() === "" ? undefined : employee;
    }
    
  }
  return employee;
};

export { 
  replaceUrl,
  addTenankey,
  removeTenantKey,
  checkAndAddTenantKey, 
  getEmployeeNameFromSubmission
};
