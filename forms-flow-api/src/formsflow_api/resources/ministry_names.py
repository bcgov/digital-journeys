"""API endpoints for managing user API resource."""

from http import HTTPStatus
from flask import current_app
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import cors_preflight, profiletime, auth
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api.services import MinistryNamesService



API = Namespace("MinistryNames", description="Ministry names")


@cors_preflight("GET, OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class MinistryNames(Resource):
    """Resource for managing ministry names"""

    @staticmethod
    @profiletime
    @auth.require
    def get():
        """Get ministry names from ODS."""
        try:
            ministry_names = MinistryNamesService.get_ministry_names()
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code
        return ministry_names, HTTPStatus.OK
