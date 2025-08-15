####
# Mapping of data from the ODS that is made available for use in the Form Builder
###
class EmployeeData():
  # data: Response retrieved from the ODS
  # Spec of possible values can be found at: https://analytics-testapi.psa.gov.bc.ca/apiserver/api.rst#Datamart_Telework_employee_demo
  def __init__(self, data, noofrecords=1, noofpositions=1):
   self.displayName = " ".join(filter(None, (data.get("first_name"), data.get("last_name"))))
   self.name = data.get("name")
   self.firstName = data.get("first_name")
   self.lastName = data.get("last_name")
   self.email = data.get("email")
   self.address = ", ".join(filter(None, [
        value.strip() for key, value in [
            ("address1", data.get("address1")),
            ("address2", data.get("address2")),
            ("city", data.get("city")),
            ("postal", data.get("postal"))
        ] if value is not None and isinstance(value, str)]))
   self.address1 = data.get("address1")
   self.address2 = data.get("address2")
   self.postal = data.get("postal")
   self.city = data.get("city")
   self.officePhone = data.get("office_phone")
   self.empId = data.get("EMPLID")
   self.positionTitle = data.get("position_title")
   self.depId = data.get("DEPTID")
   self.mailAddress = ", ".join(filter(None, [
        value.strip() for key, value in [
            ("mail_address1", data.get("mail_address1")),
            ("mail_address2", data.get("mail_address2")),
            ("mail_city", data.get("mail_city")),
            ("mail_stateprovince", data.get("mail_stateprovince")),
            ("mail_postal", data.get("mail_postal"))
        ] if value is not None and isinstance(value, str)]))
   self.mailAddress1 = data.get("mail_address1")
   self.mailAddress2 = data.get("mail_address2")
   self.mailCity = data.get("mail_city")
   self.mailCountry = data.get("mail_country")
   self.mailPostal = data.get("mail_postal")
   self.mailStateprovince = data.get("mail_stateprovince")
   self.officeAddress = ", ".join(filter(None, [
        value.strip() for key, value in [
            ("office_address1", data.get("office_address1")),
            ("office_address2", data.get("office_address2")),
            ("office_city", data.get("office_city")),
            ("office_stateprovince", data.get("office_stateprovince")),
            ("office_postal", data.get("office_postal"))
        ] if value is not None and isinstance(value, str)]))
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
   self.phone = data.get("phone")
   # Possible values: "F" for full-time, "P" for part-time, "D" for on demand     
   self.fullPartTime = data.get("FULL_PART_TIME")
   # Possible values:  "P" for Primary, "S" for Secondary and "N" for Not Applicable
   self.jobIndicator = data.get("job_indicator")
   self.noofrecords = noofrecords
   self.noofpositions = noofpositions
