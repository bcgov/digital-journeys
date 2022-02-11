"""API endpoints for managing user API resource."""

from http import HTTPStatus
from flask_restx import Namespace, Resource
from formsflow_api.utils import cors_preflight, profiletime
import requests


API = Namespace("Users", description="User related operations")


@cors_preflight("GET")
@API.route("/me", methods=["GET"])
class UserResource(Resource):
    """Resource for managing users."""

    @staticmethod
    @profiletime
    def get():
        """Get the user data"""
        print("UserResource.get()3")
        r = requests.get('https://reqres.in/api/users?page=2')
        print(r)
        return (
            ({"message": "you reached users endpints"}),
            HTTPStatus.OK,
        )
