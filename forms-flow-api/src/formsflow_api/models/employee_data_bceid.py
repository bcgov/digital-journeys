class EmployeeDataFromKeycloak():
  def __init__(self, data):
   self.displayName = " ".join(filter(None, (data["first_name"], data["last_name"])))
   self.firstName = data["first_name"]
   self.lastName = data["last_name"]
   self.email = data["email"]
