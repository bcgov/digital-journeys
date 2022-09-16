import requests
from http import HTTPStatus
from flask import current_app
from formsflow_api import cache
from formsflow_api.models.employee_names import EmployeeNames


class EmployeeNamesService:     
    @staticmethod
    # @cache.cached(timeout=3600, key_prefix='get-employee-names')
    def get_employee_names(args):
      try:
        search = args.get("search", None)
        query = f"&$search='{search}'" if search else ""
        limit = args.get("limit", 10)
        top = f"&$top={limit}"
        offset = args.get("skip", 0)
        skip = f"&$skip={offset}"
        select_fields = "name,first_name,last_name,EMPLID,position_title,office_city,level2_division,level3_branch"

        url="{}?$select={}&$orderby=name{}{}{}".format(current_app.config.get("EMPLOYEE_NAMES_API_URL"), select_fields, query, top, skip)
        response_from_ods = requests.get(url,
                       headers={"Authorization": current_app.config.get("ODS_AUTH_TOKEN")})

      except Exception as e:
        return {"message": "Failed to get employee names from ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
      
      employee_names_res = response_from_ods.json()
      if employee_names_res and employee_names_res["value"] and len(employee_names_res["value"]) > 0:
        return employee_names_res["value"]
      
      return {"message": "No user data found"}, HTTPStatus.NOT_FOUND
