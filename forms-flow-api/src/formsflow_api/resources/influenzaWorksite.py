"""API endpoints for managing user API resource."""

from http import HTTPStatus
from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import (
    auth,
    cors_preflight,
    profiletime,
)
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api.services import InfluenzaService



API = Namespace("influenzaWorksite", description="Influenza Worksite Registration")

@cors_preflight("GET,  OPTIONS")
@API.route("/city", methods=["GET", "OPTIONS"])
class InfluenzaCity(Resource):
    """cities"""

    @staticmethod
    @profiletime
    @auth.require
    def get():
        """get cities"""
        try:
            cities = InfluenzaService.get_cities()
            return cities, HTTPStatus.OK
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code


@cors_preflight("GET,  OPTIONS")
@API.route("/ministry", methods=["GET", "OPTIONS"])
class InfluenzaMinistry(Resource):
    """Ministry"""

    @staticmethod
    @profiletime
    @auth.require
    def get():
        """get ministries list for Influenza"""
        try:
            ministries = InfluenzaService.get_ministry_names()
            return ministries, HTTPStatus.OK
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code


@cors_preflight("GET,  OPTIONS")
@API.route("/worksite", methods=["GET", "OPTIONS"])
class InfluenzaWorksite(Resource):
    """Worksite"""

    @staticmethod
    @profiletime
    @auth.require
    def get():
        """get influenza worksite"""
        try:
            args = request.args
            worksites = InfluenzaService.get_worksites(args)
            return worksites, HTTPStatus.OK
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code


@cors_preflight("GET,  OPTIONS")
@API.route("/worksite_registration", methods=["GET", "OPTIONS"])
class InfluenzaWorksite(Resource):
    """Worksite's registration"""

    @staticmethod
    @profiletime
    @auth.require
    def get():
        """get influenza worksite registrations"""
        try:
            args = request.args
            worksites = InfluenzaService.get_worksite_registrations(args)
            return worksites, HTTPStatus.OK
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code


@cors_preflight("GET,  OPTIONS")
@API.route("/worksites_ministries", methods=["GET", "OPTIONS"])
class InfluenzaWorksite(Resource):
    """worksites_ministries"""

    @staticmethod
    @profiletime
    @auth.require
    def get():
        """get influenza worksites_ministries"""
        try:
            args = request.args
            worksites_ministries = InfluenzaService.get_worksites_ministries(args)
            return worksites_ministries, HTTPStatus.OK
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code

@cors_preflight("GET,  OPTIONS")
@API.route("/worksites_registrations", methods=["GET", "OPTIONS"])
class InfluenzaWorksite(Resource):
    """worksites_registrations"""

    @staticmethod
    @profiletime
    @auth.require
    def get():
        """get influenza worksites_registrations"""
        try:
            args = request.args
            worksites_registrations = InfluenzaService.get_worksites_registrations(args)
            return worksites_registrations, HTTPStatus.OK
        except BusinessException as err:
            current_app.logger.warning(err.error)
            return err.error, err.status_code
