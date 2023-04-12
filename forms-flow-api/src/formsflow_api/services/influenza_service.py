import requests
from http import HTTPStatus
from flask import current_app
from formsflow_api_utils.exceptions import BusinessException

class InfluenzaService:
    """This class manages Influenza form related service."""

    @staticmethod
    def get_ministry_names():
        """fetch ministry_names"""
        try:
            ministry_api_url = "{}/ODS_Datamart_influenza_ministry".format(current_app.config.get("ODS_URL"))
            response_from_ods = requests.get(ministry_api_url,
                        headers={"Authorization": current_app.config.get("ODS_AUTH_TOKEN")})
        except Exception as e:
            raise BusinessException(
                {"message": "Failed to look up ministries in ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
            )
        
        ministry_names_res = response_from_ods.json()
        if ministry_names_res and "value" in ministry_names_res and len(ministry_names_res["value"]) > 0:
            return ministry_names_res["value"]
        raise BusinessException(
          {"message": "No ministry data found"}, HTTPStatus.NOT_FOUND
        )
    
    @staticmethod
    def get_cities():
        """fetch cities"""
        try:
            cities_api_url = "{}/ODS_Datamart_influenza_city".format(current_app.config.get("ODS_URL"))
            response_from_ods = requests.get(cities_api_url,
                        headers={"Authorization": current_app.config.get("ODS_AUTH_TOKEN")})
        except Exception as e:
            raise BusinessException(
                {"message": "Failed to look up cities in ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
            )
        
        cities_res = response_from_ods.json()
        if cities_res and "value" in cities_res and len(cities_res["value"]) > 0:
            return cities_res["value"]
        raise BusinessException(
          {"message": "No city data found"}, HTTPStatus.NOT_FOUND
        )
    
    @staticmethod
    def get_worksites(args):
        """fetch influenza worksites"""
        try:
            worksites_api_url = "{}/ODS_Datamart_influenza_worksite".format(current_app.config.get("ODS_URL"))
            mid = args.get("mid", None) # Ministry ID
            query = ""
            if mid:
                query = f"mID eq {mid}"
            if query != "":
                query = f"$filter={query}"
            url="{}?{}".format(worksites_api_url, query)
            response_from_ods = requests.get(url,
                        headers={"Authorization": current_app.config.get("ODS_AUTH_TOKEN")})
        except Exception as e:
            raise BusinessException(
                {"message": "Failed to look up worksites in ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
            )
        
        worksites_res = response_from_ods.json()
        if worksites_res and "value" in worksites_res and len(worksites_res["value"]) > 0:
            return worksites_res["value"]
        raise BusinessException(
          {"message": "No worksite data found"}, HTTPStatus.NOT_FOUND
        )
