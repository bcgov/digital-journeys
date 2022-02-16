import json
import requests
from http import HTTPStatus

class EmployeeDataService: 
    
    @staticmethod
    def get_employee_data_from_bcgov(guid):
      #TODO: get auth token from bcgov using @param guid
      try:
        responseFromBCGov = requests.get('https://analytics-testapi.psa.gov.bc.ca/apiserver/api.rsc/Datamart_Telework_employee_demo/',
                       headers={'Authorization': 'Basic XXXXXXXXXXXXXXXXXXXX'})
      except:
        return {"message": "Something went wrong!"}, HTTPStatus.INTERNAL_SERVER_ERROR
      
      #TODO: check response for data and return accordingly. No all users have data
      employeeDataRes = responseFromBCGov.json()
      employeeData = employeeDataRes['value'][0]
      return employeeData

    