class EmployeeDataBceid():
  def __init__(self, data):
   self.displayName = data["first_name"] + " " + data["last_name"]
   self.firstName = data["first_name"]
   self.lastName = data["last_name"]
   self.email = data["email"]
