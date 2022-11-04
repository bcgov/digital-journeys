"""API endpoints for release note resource."""
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
from formsflow_api.services import ReleaseNoteService
from formsflow_api.schemas import ReleaseNoteSchema

API = Namespace("Release Note", description="Release Note endpoints")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class ReleaseNoteResource(Resource):
    """Resource for managing release notes."""

    @staticmethod
    @auth.require
    @profiletime
    @auth.has_one_of_roles([DESIGNER_GROUP])
    def post():
        """Create a new release note."""
        try:
            release_note_json = request.get_json()
            res = ReleaseNoteService.create_new_release_note(
                release_note_json
            )
            response = ReleaseNoteSchema().dump(res) or {}
            return (response, HTTPStatus.CREATED)
        except BusinessException as err:
            current_app.logger.warning(err)
            response, status = err.error, err.status_code
            return response, status
        except BaseException as base_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid release note data",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(base_err)
            return response, status
    

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """list release notes."""
        try:
            res = ReleaseNoteService.list_release_notes()
            response = ReleaseNoteSchema().dump(res, many=True) or {}
            return (response, HTTPStatus.OK)
        except BusinessException as err:
            current_app.logger.warning(err)
            response, status = err.error, err.status_code
            return response, status
        except BaseException as base_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid release note request data",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(base_err)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/unread", methods=["GET", "OPTIONS"])
class ReleaseNoteUnreadResource(Resource):
    """Resource for managing release notes."""

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """Retrieve unread release note."""
        try:
            release_note = ReleaseNoteService.get_unread_release_note()
            if not release_note:
                return ({}, HTTPStatus.NOT_FOUND)
            response = ReleaseNoteSchema().dump(release_note) or {}
            return (response, HTTPStatus.OK)

        except BaseException as base_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid release note data",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(base_err)
            return response, status


@cors_preflight("POST,OPTIONS")
@API.route("/read", methods=["POST", "OPTIONS"])
class ReleaseNoteMapUserResource(Resource):
    """Resource for managing release notes read by user."""

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Create a new entry for release note read by user."""
        try:
            release_note_json = request.get_json()
            res = ReleaseNoteService.release_note_read_by_user(
                release_note_json
            )
            return ({}, HTTPStatus.CREATED)
        except BusinessException as err:
            current_app.logger.warning(err)
            response, status = err.error, err.status_code
            return response, status
        except BaseException as base_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid release note user data",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(base_err)
            return response, status
