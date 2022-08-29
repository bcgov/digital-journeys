import requests
from http import HTTPStatus
from flask import current_app
from formsflow_api.models.employee_data import EmployeeData

class EmployeeDataService: 
    
    @staticmethod
    def get_employee_data_from_bcgov(guid):
      #TODO: get auth token from bcgov using @param guid
      
      employee_data_api_url = current_app.config.get("EMPLOYEE_DATA_API_URL")
      test_auth_token = current_app.config.get(
          "ODS_AUTH_TOKEN")

      try:
        response_from_BCGov = requests.get("{}?$filter=GUID eq '{}'".format(employee_data_api_url, guid),
                       headers={"Authorization": test_auth_token})
      except:
        return {"message": "Failed to look up user in ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
      
      #TODO: check response for data and return accordingly. No all users have data
      employee_data_res = response_from_BCGov.json()

      if employee_data_res and employee_data_res["value"] and len(employee_data_res["value"]) > 0:
        emp_data = EmployeeData(employee_data_res["value"][0])
        return emp_data.__dict__
      return {"message": "No user data found"}, HTTPStatus.NOT_FOUND
