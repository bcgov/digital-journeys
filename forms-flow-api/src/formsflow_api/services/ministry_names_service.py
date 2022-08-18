import requests
from http import HTTPStatus
from flask import current_app
from formsflow_api import cache
from formsflow_api.models.ministry_names import MinistryNames



class MinistryNamesService:     
    @staticmethod
    @cache.cached(timeout=3600, key_prefix='get-ministry-names')
    def get_ministry_names():
      try:
        response_from_ods = requests.get(current_app.config.get("MINISTRY_NAMES_API_URL"),
                       headers={"Authorization": current_app.config.get("ODS_AUTH_TOKEN")})

      except:
        return {"message": "Failed to get ministry names from ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
      
      ministry_names_res = response_from_ods.json()
      if ministry_names_res and ministry_names_res["value"] and len(ministry_names_res["value"]) > 0:
        ministry_names_data = MinistryNames(ministry_names_res["value"])
        return ministry_names_data.data
      
      return {"message": "No user data found"}, HTTPStatus.NOT_FOUND