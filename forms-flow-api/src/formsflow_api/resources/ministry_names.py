"""API endpoints for managing user API resource."""

from http import HTTPStatus
from flask_restx import Namespace, Resource
from formsflow_api.utils import cors_preflight, profiletime
from formsflow_api.utils import auth
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
        ministry_names = MinistryNamesService.get_ministry_names()
        return ministry_names, HTTPStatus.OK
