"""API endpoints for alert note resource."""
from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (
    DESIGNER_GROUP,
    auth,
    cors_preflight,
    profiletime,
)
# from marshmallow.exceptions import ValidationError
from formsflow_api.services import AlertNoteService
from formsflow_api.schemas import AlertNoteSchema

API = Namespace("Alert Note", description="Alert Note endpoints")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class AlertNoteResource(Resource):
    """Resource for managing alert notes."""

    @staticmethod
    @auth.require
    @profiletime
    @auth.has_one_of_roles([DESIGNER_GROUP])
    def post():
        """Create a new alert note."""
        try:
            alert_note_json = request.get_json()
            res = AlertNoteService.create_new_alert_note(
                alert_note_json
            )
            response = AlertNoteSchema().dump(res) or {}
            return (response, HTTPStatus.CREATED)
        except BusinessException as err:
            current_app.logger.warning(err)
            response, status = err.error, err.status_code
            return response, status
        except BaseException as base_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid alert note data",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(base_err)
            return response, status
    

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """list alert notes."""
        try:
            res = AlertNoteService.list_alert_notes()
            response = AlertNoteSchema().dump(res, many=True) or {}
            return (response, HTTPStatus.OK)
        except BusinessException as err:
            current_app.logger.warning(err)
            response, status = err.error, err.status_code
            return response, status
        except BaseException as base_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid alert note request data",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(base_err)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/active-note", methods=["GET", "OPTIONS"])
class AlertNoteActiveResource(Resource):
    """Resource for reading alert notes."""

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """Retrieve active alert note."""
        try:
            alert_note = AlertNoteService.get_active_alert_note()
            if not alert_note:
                return ({}, HTTPStatus.NOT_FOUND)
            response = AlertNoteSchema().dump(alert_note) or {}
            return (response, HTTPStatus.OK)

        except BaseException as base_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid alert note data",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(base_err)
            return response, status
