export default class EmployeeDataModel {
  // Use this class properties names in the form builder ("Property Name" under API tab) to fill the form with the employee data.

  constructor(data) {
    this.__firstName = data?.first_name || "";
    this.__lastName = data?.last_name || "";
    this.__middleName = data?.middle_name || "";
    this.__name = data?.name || "";
    this.__businessUnit = data?.BUSINESS_UNIT || "";
    this.__classificationGroup = data?.ClassificationGroup || "";
    this.__depId = data?.DEPTID || "";
    this.__EFFDT = data?.EFFDT || "";
    this.__EFFSEQ = data?.EFFSEQ || "";
    this.__empId = data?.EMPLID || "";
    this.__empClass = data?.EMPL_CLASS || "";
    this.__empCTG = data?.EMPL_CTG || "";
    this.__empRCD = data?.EMPL_RCD || "";
    this.__empStatus = data?.EMPL_STATUS || "";
    this.__GUID = data?.GUID || "";
    this.__hireDate = data?.HIRE_DT || "";
    this.__IDIR = data?.IDIR || "";
    this.__jobCode = data?.JOBCODE || "";
    this.__jobFunction = data?.JOB_FUNCTION || "";
    this.__jobCodeDescGroup = data?.JobCodeDescGroup || "";
    this.__occupationalGroup = data?.OccupationalGroup || "";
    this.__organization = data?.Organization || "";
    this.__payGroup = data?.PAYGROUP || "";
    this.__address1 = data?.address1 || "";
    this.__address2 = data?.address2 || "";
    this.__appointmentStatus = data?.appointment_status || "";
    this.__city = data?.city || "";
    this.__country = data?.country || "";
    this.__email = data?.email || "";
    this.__employeeStatusLongDescription =
      data?.employee_status_long_description || "";
    this.__jobFunctionEmployeeGroup = data?.job_function_employee_group || "";
    this.__jobCodeDesc = data?.jobcode_desc || "";
    this.__officeAddress1 = data?.office_address1 || "";
    this.__officeAddress2 = data?.office_address2 || "";
    this.__officeCity = data?.office_city || "";
    this.__officeCountry = data?.office_country || "";
    this.__officeLocationCode = data?.office_location_code || "";
    this.__officePhone = data?.office_phone || "";
    this.__officePostal = data?.office_postal || "";
    this.__officeStateprovince = data?.office_stateprovince || "";
    this.__phone = data?.phone || "";
    this.__positionNumber = data?.position_number || "";
    this.__positionTitle = data?.position_title || "";
    this.__postal = data?.postal || "";
    this.__stateprovince = data?.stateprovince || "";
    this.__supervisorEmail = data?.supervisor_email || "";
    this.__supervisorName = data?.supervisor_name || "";
    this.__supervisorPositionNumber = data?.supervisor_position_number || "";
    this.__supervisorPositionTitle = data?.supervisor_position_title || "";
  }
}