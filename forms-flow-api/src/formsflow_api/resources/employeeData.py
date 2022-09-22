"""API endpoints for managing user API resource."""

from http import HTTPStatus
from flask import g, current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api.services import EmployeeDataService



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
        except:
            return {"message": "Something went wrong!"}, HTTPStatus.INTERNAL_SERVER_ERROR

        if not GUID:
            return {"message": "user had no guid!"}, HTTPStatus.NOT_FOUND

        try:
            userData = EmployeeDataService.get_employee_data_from_bcgov(GUID)
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
    def get():
        """Get employee names from ODS."""
        args = request.args
        print(args)
        try:
            employee_names = EmployeeDataService.get_employee_names(args)
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code

        return employee_names, HTTPStatus.OK
