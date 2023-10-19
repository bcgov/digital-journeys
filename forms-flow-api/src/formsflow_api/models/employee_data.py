####
# Mapping of data from the ODS that is made available for use in the Form Builder
###
class EmployeeData():
  # data: Response retrieved from the ODS
  # Spec of possible values can be found at: https://analytics-testapi.psa.gov.bc.ca/apiserver/api.rst#Datamart_Telework_employee_demo
  def __init__(self, data):
   self.displayName = " ".join(filter(None, (data.get("first_name"), data.get("last_name"))))
   self.name = data.get("name")
   self.firstName = data.get("first_name")
   self.lastName = data.get("last_name")
   self.email = data.get("email")
   self.address = ", ".join(filter(None, 
                                  (data.get("address1").strip(),
                                   data.get("address2").strip(),
                                   data.get("city").strip(),
                                   data.get("postal").strip())))
   self.address1 = data.get("address1")
   self.address2 = data.get("address2")
   self.postal = data.get("postal")
   self.city = data.get("city")
   self.officePhone = data.get("office_phone")
   self.empId = data.get("EMPLID")
   self.positionTitle = data.get("position_title")
   self.depId = data.get("DEPTID")
   self.officeAddress = ", ".join(filter(None, 
                                  (data.get("office_address1").strip(),
                                   data.get("office_address2").strip(),
                                   data.get("office_city").strip(),
                                   data.get("office_stateprovince").strip(),
self.officeAddress = ", ".join(filter(None, [
    value.strip() for key, value in [
        ("office_address1", data.get("office_address1")),
        ("office_address2", data.get("office_address2")),
        ("office_city", data.get("office_city")),
        ("office_stateprovince", data.get("office_stateprovince")),
        ("office_postal", data.get("office_postal"))
    ] if value is not None and isinstance(value, str)
]))
   self.officeAddress1 = data.get("office_address1")
   self.officeAddress2 = data.get("office_address2")
   self.officeCity = data.get("office_city")
   self.officeCountry = data.get("office_country")
   self.officePostal = data.get("office_postal")
   self.officeStateprovince = data.get("office_stateprovince")
   self.organization = data.get("Organization")
   self.divisionLevel2 = data.get("level2_division")
   self.supervisorName = data.get("supervisor_name")
   self.managerEmail = data.get("supervisor_email")
   self.supervisorPositionTitle = data.get("supervisor_position_title")
   self.empCtg = data.get("EMPL_CTG")
   self.appointmentStatus = data.get("appointment_status")
   self.salAdminPlan = data.get("sal_admin_plan")
   self.fullPartTime = data.get("full_part_time")
   self.phone = data.get("phone")
