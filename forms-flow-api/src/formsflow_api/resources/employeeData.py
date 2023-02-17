"""API endpoints for managing user API resource."""

from http import HTTPStatus
from flask import g, current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api.services import EmployeeDataService



API = Namespace("EmployeeData", description="Employee Data realted operations")
EMPLOYEE_SEARCH_ROLE = "employee-search"

@cors_preflight("GET, OPTIONS")
@API.route("/me", methods=["GET", "OPTIONS"])
class EmployeeDataResource(Resource):
    """Employee Data"""

    @staticmethod
    @profiletime
    @auth.require
    def get():
        # """Get the employee data based on bcGov guid."""
        # try:
        #     GUID = g.token_info.get("bcgovguid")
        #     BCeID = g.token_info.get("bceid_user_guid")
        #     BCSC = g.token_info.get("bcsc_user_guid")
        # except:
        #     return {"message": "Something went wrong!"}, HTTPStatus.INTERNAL_SERVER_ERROR

        # try:
        #     if BCeID:
        #         userData = EmployeeDataService.get_employee_data_from_bceid()
        #     elif BCSC:
        #         userData = EmployeeDataService.get_employee_data_from_bcsc()
        #     elif GUID:
        #         userData = EmployeeDataService.get_employee_data_from_bcgov(GUID)
        #     else:
        #         return {"message": "user idp is not any of IDIR or BCeID!"}, HTTPStatus.NOT_FOUND
        # except BusinessException as err:
        #     current_app.logger.warning(err.error)
        #     return err.error, err.status_code
        
        # return userData, HTTPStatus.OK
        return {"firstName":"Bhumin", "lastName": "Patel", "email":"bhumin@gov.bc.ca"}, HTTPStatus.OK


@cors_preflight("GET, OPTIONS")
@API.route("/names", methods=["GET", "OPTIONS"])
class EmployeeNames(Resource):
    """Resource for managing employee names"""

    @staticmethod
    @profiletime
    @auth.require
    @auth.has_one_of_roles([EMPLOYEE_SEARCH_ROLE])
    def get():
        """Get employee names from ODS. Users must have employee-search role to be able to access this endpoint."""

        args = request.args
        try:
            employee_names = EmployeeDataService.get_employee_names(args)
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code

        return employee_names, HTTPStatus.OK
