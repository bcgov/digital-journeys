"""API endpoints for managing user API resource."""

from http import HTTPStatus
from flask import g, current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import (
    DESIGNER_GROUP,
    auth,
    cors_preflight,
    profiletime,
    # SL_REVIEW_GROUP,
)
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api.services import EmployeeDataService, KeycloakService



API = Namespace("EmployeeData", description="Employee Data realted operations")

@cors_preflight("GET, OPTIONS")
@API.route("/me", methods=["GET", "OPTIONS"])
class EmployeeDataResource(Resource):
    """Employee Data"""

    @staticmethod
    @profiletime
    @auth.require
    def get():
        """Get the employee data based on bcGov guid."""
        try:
            GUID = g.token_info.get("bcgovguid")
            BCeID = g.token_info.get("bceid_user_guid")
            BCSC = g.token_info.get("bcsc_user_guid")
            LDB = g.token_info.get("ldb_uid")
        except:
            return {"message": "Something went wrong!"}, HTTPStatus.INTERNAL_SERVER_ERROR

        try:
            if BCeID:
                userData = EmployeeDataService.get_employee_data_from_bceid()
            elif BCSC:
                userData = EmployeeDataService.get_employee_data_from_bcsc()
            elif LDB:
                userData = EmployeeDataService.get_employee_data_from_ldb()
            elif GUID:
                userData = EmployeeDataService.get_employee_data_from_bcgov(GUID)
            else:
                return {"message": "user idp is not supported!"}, HTTPStatus.NOT_FOUND
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code
        
        return userData, HTTPStatus.OK


@cors_preflight("GET, OPTIONS")
@API.route("/names", methods=["GET", "OPTIONS"])
class EmployeeNames(Resource):
    """Resource for managing employee names"""

    @staticmethod
    @profiletime
    @auth.require
    # @auth.has_one_of_roles([SL_REVIEW_GROUP])
    def get():
        """Get employee names from ODS. Users must have employee-search role to be able to access this endpoint."""

        args = request.args
        try:
            employee_names = EmployeeDataService.get_employee_names(args)
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code

        return employee_names, HTTPStatus.OK


@cors_preflight("POST, OPTIONS")
@API.route("/user-group", methods=["POST", "OPTIONS"])
class EmployeeGroup(Resource):
    """Employee and Group Data"""

    @staticmethod
    @profiletime
    @auth.require
    @auth.has_one_of_roles([DESIGNER_GROUP])
    def post():
        """Process users"""
        try:
            data = request.get_json()
            group = data.get("group")
            users = data.get("users")
            if group and users:
                kcService = KeycloakService()
                result, groupId = kcService.add_users(group, users)
                if groupId:
                    return result, HTTPStatus.OK
                return {"errorMessage": "Group not found"}, HTTPStatus.NOT_FOUND
            else:
                return {"errorMessage": "Provide group and users"}, HTTPStatus.BAD_REQUEST
        except Exception as e:
            return {"errorMessage": f"Resource function error: {e}"}, HTTPStatus.BAD_REQUEST

@cors_preflight("GET, OPTIONS")
@API.route("/info", methods=["GET", "OPTIONS"])
class EmployeeInfo(Resource):
    """Employee Info"""

    @staticmethod
    @profiletime
    @auth.require
    def get():
        """Get the employee info."""
        args = request.args
    
        try:
            employee_info = EmployeeDataService.get_employee_info(args)
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code
        
        return employee_info, HTTPStatus.OK

@cors_preflight("GET, OPTIONS")
@API.route("/query", methods=["GET", "OPTIONS"])
class EmployeeQuery(Resource):
    """Perform queries"""

    @staticmethod
    @profiletime
    @auth.require
    def get():
        """Perform query on Datamart."""
        args = request.args
    
        try:
            employee_info = EmployeeDataService.perform_query(args)
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code
        
        return employee_info, HTTPStatus.OK
