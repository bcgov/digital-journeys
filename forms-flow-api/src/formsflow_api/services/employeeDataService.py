import requests
import re
from urllib.parse import unquote
from http import HTTPStatus
from flask import current_app, g
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (cache)
from formsflow_api.models.employee_data import EmployeeData
from formsflow_api.models.employee_data_bceid import EmployeeDataFromKeycloak

class EmployeeDataService: 
    
    @staticmethod
    def get_employee_data_from_bcgov(guid):
      #TODO: get auth token from bcgov using @param guid
      
      employee_data_api_url = current_app.config.get("EMPLOYEE_DATA_API_URL")
      print("employee_data_api_url")
      print(employee_data_api_url)
      test_auth_token = current_app.config.get(
          "ODS_AUTH_TOKEN")
      emp_data = cache.get(guid)
      if emp_data is None:
        try:
          response_from_BCGov = requests.get("{}?$filter=GUID eq '{}'".format(employee_data_api_url, guid),
                        headers={"Authorization": test_auth_token})
        except:
          raise BusinessException(
            {"message": "Failed to look up user in ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
          )
        
        #TODO: check response for data and return accordingly. No all users have data
        employee_data_res = response_from_BCGov.json()
       
        if employee_data_res and employee_data_res["value"] and len(employee_data_res["value"]) > 0:
          emp_data = EmployeeData(employee_data_res["value"][0], len(employee_data_res["value"]))
          cache.set(guid, emp_data, timeout=14400)
          return emp_data.__dict__
      else:
        return emp_data.__dict__
      raise BusinessException(
          {"message": "No user data found"}, HTTPStatus.NOT_FOUND
        )
    
    @staticmethod
    def get_employee_data_from_bceid():
      email = g.token_info.get("email")
      given_name = g.token_info.get("given_name")
      family_name = g.token_info.get("family_name")

      # BCeID currently provides user's display_name under given_name attribute. 
      # Therefore we need to manually extract given_name and family_name from it.
      if (given_name and not family_name):
        # split the first word into given name and the rest into family name.
        names = given_name.split(" ", 1)
        given_name = names[0]
        if (len(names) > 1):
          family_name = names[1]
      
      data = {
        "first_name": given_name,
        "last_name": family_name,
        "email": email
      }
      emp_data = EmployeeDataFromKeycloak(data)
      return emp_data.__dict__

    @staticmethod
    def get_employee_data_from_bcsc():
      email = g.token_info.get("email")
      family_name = g.token_info.get("family_name")
      given_name = g.token_info.get("given_name")
      data = {
        "first_name": given_name,
        "last_name": family_name,
        "email": email
      }
      emp_data = EmployeeDataFromKeycloak(data)
      return emp_data.__dict__
    
    @staticmethod
    def get_employee_data_from_ldb():
      email = g.token_info.get("email")
      family_name = g.token_info.get("family_name")
      given_name = g.token_info.get("given_name")
      data = {
        "first_name": given_name,
        "last_name": family_name,
        "email": email
      }
      emp_data = EmployeeDataFromKeycloak(data)
      return emp_data.__dict__

    @staticmethod
    def get_employee_names(args):
      try:
        employee_data_api_url = current_app.config.get("EMPLOYEE_SEARCH_API_URL")
        print("employee_data_api_url")
        print(employee_data_api_url)
        search = args.get("search", None)

        v = args.get("v", None)

        query = ""

        # 2069 Added additional search capabilities
        if v and v == "v2":
          
          sanitize = lambda term: re.sub(r'[^A-Za-z\-]+', '', unquote(term))
          """
          fields = contains.split(",")
          search = [f"startswith({x}, '{sanitize(term)}')" for x in fields for term in search.split(',')]
          filter = " or ".join(search)
          query = f"&$filter={filter}"
          """

          search_parts = re.split(r'[, ]+', search)
          name_filter = ""
          email_filter = ""

          [last_name, first_name] = [search_parts[0], None]

          if ( len(search_parts) > 1 ):
            first_name = search_parts[1]

          if last_name is not None:
            name_filter = f"contains(name, '{sanitize(last_name)}')"
            email_filter = f"contains(email, '.{sanitize(last_name)}')"
          
          if first_name is not None:
            name_filter += f" and contains(name, '{sanitize(first_name)}')"
            email_filter = f"startswith(email, '{sanitize(first_name)}') and {email_filter}"

          query = f"&$filter=({name_filter}) or ({email_filter})"  

        else:  

          # 2069 New search in _v2 Endpoint does not work when non-alpha chars are replaced
          
          if search and not search.isalpha():
            #search = re.sub(r'[^A-Za-z]+', '_', unquote(search))
            search = re.sub(r',(\w)', ', \g<1>', unquote(search))

          query = f"&$search='{search}'" if search else ""
        

        print(f"Search query: {query}")

        limit = args.get("limit", 10)
        top = f"&$top={limit}"
        offset = args.get("skip", 0)
        skip = f"&$skip={offset}"

        fields = ["name","first_name","last_name","middle_name","Organization","level1_program",
        "EMPLID","position_title","office_city","city","level2_division","level3_branch","DEPTID",
        "supervisor_email","supervisor_name","supervisor_first_name","supervisor_last_name", "email", "IDIR", "ClassificationGroup"] # PB Added email, idir and ClassificationGroup to field list
        select_fields = ",".join(fields)

        url="{}?$select={}&$orderby=name{}{}{}".format(employee_data_api_url, select_fields, query, top, skip)
        response_from_ods = requests.get(url,
                       headers={"Authorization": current_app.config.get("ODS_AUTH_TOKEN")})

      except Exception as e:
        current_app.logger.error(e)
        return []
      
      employee_names_res = response_from_ods.json()
      if employee_names_res and employee_names_res["value"] and len(employee_names_res["value"]) > 0:
        #2069 Returning array of objects that will make use of new name format
        employees = [ {**employee, "name": EmployeeData.format_name(employee["name"]) } for employee in employee_names_res["value"]]
        return employees
        #return employee_names_res["value"]
      return []
    
    @staticmethod
    def get_employee_info(args):
      employee_data_api_url = current_app.config.get("EMPLOYEE_DATA_API_URL")
      auth_token = current_app.config.get("ODS_AUTH_TOKEN")
      
      # Get the query params
      email = args.get("email")
      emp_id = args.get("employeeId")
      supervisor_email = args.get("supervisorEmail")
      want_multiple = args.get("wantMultiple", 0)
      select = args.get("select")

      # Generate the filter query
      filter_list = []
      if email:
        filter_list.append(f"email eq '{email}'")
      
      if emp_id:
        filter_list.append(f"EMPLID eq '{emp_id}'")

      # PB Added supervisor email as a filter option
      if supervisor_email:
        filter_list.append(f"supervisor_email eq '{supervisor_email}'")

      if not filter_list:
        raise BusinessException(
          {"message": "No filter provided"}, HTTPStatus.BAD_REQUEST
        )

      filter_query = "$filter=" + " and ".join(filter_list)

      # Append queries (filter, select and etc.) to a list and join them with '&'
      queries = []
      queries.append(filter_query)
      if select:
        select_query = f"$select={select}"
        queries.append(select_query)
      query = '&'.join(queries)

      try:
        url = f"{employee_data_api_url}?{query}"
        ods_response = requests.get(url, headers={"Authorization": auth_token})
      except:
        raise BusinessException(
          {"message": "Failed to look up user info in ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
        )

      employee_info = ods_response.json().get("value")
      #2069 Returning array/single object(s) that will make use of new name format
      if employee_info and len(employee_info) > 0:
        if want_multiple:
          employees = [ {**employee, "name": EmployeeData.format_name(employee["name"]) } for employee in employee_info]
          return employees
          #return employee_info
        else:

          employee = {**employee_info[0], "name": EmployeeData.format_name(employee_info[0]["name"]) }
          return employee
      else:
        raise BusinessException(
          {"message": "No user info found"}, HTTPStatus.NOT_FOUND
        )
