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
            ministry_api_url = "{}/ods_datamart_influenza_ministries".format(current_app.config.get("ODS_URL"))
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
    def get_worksites(args):
        """fetch influenza worksites"""
        try:
            worksites_api_url = "{}/ods_datamart_influenza_worksites".format(current_app.config.get("ODS_URL"))
            response_from_ods = requests.get(worksites_api_url,
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
    
    @staticmethod
    def get_worksite_registrations(args):
        """fetch influenza worksites"""
        try:
            registrations_api_url = "{}/ods_datamart_influenza_registrations".format(current_app.config.get("ODS_URL"))
            response_from_ods = requests.get(registrations_api_url,
                        headers={"Authorization": current_app.config.get("ODS_AUTH_TOKEN")})
        except Exception as e:
            raise BusinessException(
                {"message": "Failed to look up worksite registrations in ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
            )
        
        registrations_res = response_from_ods.json()
        if registrations_res and "value" in registrations_res and len(registrations_res["value"]) > 0:
            return registrations_res["value"]
        raise BusinessException(
          {"message": "No worksite data found"}, HTTPStatus.NOT_FOUND
        )

    @staticmethod
    def get_worksites_ministries(args):
      worksite_ministry_url = current_app.config.get("ODS_URL") + "/ods_datamart_influenza_vw_worksites_ministries_joined"
      auth_token = current_app.config.get("ODS_AUTH_TOKEN")
      
      # Get the query params
      ministry_id = args.get("ministry_id")
      worksite_id = args.get("worksite_id")
      wm_id = args.get("wm_id")
      m_name = args.get("m_name")
      select = args.get("select")

      # Generate the filter query
      filter_list = []
      if ministry_id:
        filter_list.append(f"ministry_id eq '{ministry_id}'")
      if wm_id:
        filter_list.append(f"wm_id eq '{wm_id}'")
      if worksite_id:
        filter_list.append(f"worksite_id eq '{worksite_id}'")
      if m_name:
        filter_list.append(f"m_name eq '{m_name}'")
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
        url = f"{worksite_ministry_url}?{query}"
        response = requests.get(url, headers={"Authorization": auth_token})
      except:
        raise BusinessException(
          {"message": "Failed to look up worksites in ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
        )

      value = response.json().get("value")
      if value:
        return value
      else:
        raise BusinessException(
          {"message": "No worksites found"}, HTTPStatus.NOT_FOUND
        )
    
    @staticmethod
    def get_worksites_registrations(args):
      worksites_registrations_url = current_app.config.get("ODS_URL") + "/ods_datamart_influenza_vw_registrations_worksites_joined"
      auth_token = current_app.config.get("ODS_AUTH_TOKEN")
      
      # Get the query params
      application_id = args.get("application_id")
      ministry_id = args.get("ministry_id")
      registrations_id = args.get("registrations_id")
      worksite_id = args.get("worksite_id")
      ministry_name = args.get("ministry_name")
      select = args.get("select")

      # Generate the filter query
      filter_list = []
      if application_id:
        filter_list.append(f"application_id eq '{application_id}'")
      if ministry_id:
        filter_list.append(f"ministry_id eq '{ministry_id}'")
      if ministry_name:
        filter_list.append(f"ministry_name eq '{ministry_name}'")
      if registrations_id:
        filter_list.append(f"registrations_id eq '{registrations_id}'")
      if worksite_id:
        filter_list.append(f"worksite_id eq '{worksite_id}'")
      
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
        url = f"{worksites_registrations_url}?{query}"
        response = requests.get(url, headers={"Authorization": auth_token})
      except:
        raise BusinessException(
          {"message": "Failed to look up worksites_registrations in ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
        )

      value = response.json().get("value")
      if value:
        return value
      else:
        raise BusinessException(
          {"message": "No worksites_registrations found"}, HTTPStatus.NOT_FOUND
        )
    
    @staticmethod
    def delete_worksites_registrations(application_id):
      delete_worksites_registrations_url = current_app.config.get("ODS_URL") + "/ods_datamart_influenza_delete_registration"
      auth_token = current_app.config.get("ODS_AUTH_TOKEN")
      try:
        requests.post(
           delete_worksites_registrations_url, 
           headers={"Authorization": auth_token},
           json={"application_id": application_id}
          )
        current_app.logger.info(f"application was deleted in ODS (warehouse) by id {application_id}")
      except:
        raise BusinessException(
          {"message": f"Failed to delete worksites_registration in ODS (warehouse) with application_id: {application_id}"}, HTTPStatus.INTERNAL_SERVER_ERROR
        )
    
    @staticmethod
    def get_registration_for_contact(args):
      registration_contact_url = current_app.config.get("ODS_URL") + "/ods_datamart_influenza_vw_registrations_by_primary_contact"
      auth_token = current_app.config.get("ODS_AUTH_TOKEN")
      
      # Get the query params
      email = args.get("email")

      # Generate the filter query
      filter_list = []
      if email:
        filter_list.append(f"email='{email}'")
      
      if not filter_list:
        raise BusinessException(
          {"message": "No filter provided"}, HTTPStatus.BAD_REQUEST
        )

      filter_query = ",".join(filter_list)
      query = '('+filter_query+')'

      try:
        url = f"{registration_contact_url}{query}"
        response = requests.get(url, headers={"Authorization": auth_token})
      except:
        raise BusinessException(
          {"message": "Failed to look up registration in ODS"}, HTTPStatus.INTERNAL_SERVER_ERROR
        )
      if response.text != "":
        return {"data": response.text}
      raise BusinessException(
        {"message": "No registration found for given contact"}, HTTPStatus.NOT_FOUND
      )
