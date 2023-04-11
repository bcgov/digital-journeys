####
# Mapping of data from the ODS that is made available for use in the Form Builder
###
class EmployeeData():
  # data: Response retrieved from the ODS
  # Spec of possible values can be found at: https://analytics-testapi.psa.gov.bc.ca/apiserver/api.rst#Datamart_Telework_employee_demo
  def __init__(self, data):
   self.displayName = " ".join(filter(None, (data["first_name"], data["last_name"])))
   self.name = data["name"]
   self.firstName = data["first_name"]
   self.lastName = data["last_name"]
   self.email = data["email"]
   self.address1 = data["address1"]
   self.address2 = data["address2"]
   self.postal = data["postal"]
   self.city = data["city"]
   self.officePhone = data["office_phone"]
   self.empId = data["EMPLID"]
   self.positionTitle = data["position_title"]
   self.depId = data["DEPTID"]
   self.officeAddress1 = data["office_address1"]
   self.officeAddress2 = data["office_address2"]
   self.officeCity = data["office_city"]
   self.officeCountry = data["office_country"]
   self.officePostal = data["office_postal"]
   self.officeStateprovince = data["office_stateprovince"]
   self.organization = data["Organization"]
   self.divisionLevel2 = data["level2_division"]
   self.supervisorName = data["supervisor_name"]
   self.managerEmail = data["supervisor_email"]
   self.supervisorPositionTitle = data["supervisor_position_title"]
   self.empCtg = data["EMPL_CTG"]
   self.appointmentStatus = data["appointment_status"]
   self.salAdminPlan = data["sal_admin_plan"]