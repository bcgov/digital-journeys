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
  let employee = '';
  if (form.toLowerCase().includes('sl review')) {
    employee = submission?.data?.employeeName?.name;
  } else if (form.toLowerCase().includes('telework agreement')) {
    employee = submission?.data?.name;
  }
  if (employee === undefined) {
    return '';
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
