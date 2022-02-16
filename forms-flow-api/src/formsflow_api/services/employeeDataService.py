import json
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
          "EMPLOYEE_DATA_AUTH_TOKEN")
      try:
        response_from_BCGov = requests.get("{}?filter = GUID eq '{}'".format(employee_data_api_url, guid),
                       headers={"Authorization": "Basic {}".format(test_auth_token)})
      except:
        return {"message": "Something went wrong!"}, HTTPStatus.INTERNAL_SERVER_ERROR
      
      #TODO: check response for data and return accordingly. No all users have data
      employee_data_res = response_from_BCGov.json()
      emp_data = EmployeeData(employee_data_res["value"][0])

      return emp_data.__dict__
      

    