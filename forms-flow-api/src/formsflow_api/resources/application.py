"""API endpoints for managing application resource."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (
    REVIEWER_GROUP,
    auth,
    cors_preflight,
    get_form_and_submission_id_from_form_url,
    profiletime,
)
from marshmallow.exceptions import ValidationError

from formsflow_api.schemas import (
    ApplicationListReqSchema,
    ApplicationListRequestSchema,
    ApplicationSchema,
    ApplicationUpdateSchema,
)
from formsflow_api.services import ApplicationService
from formsflow_api.services import InfluenzaService
from formsflow_api.models import Application
from formsflow_api_utils.utils.user_context import UserContext, user_context

API = Namespace("Application", description="Application")


@cors_preflight("GET,POST,OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class ApplicationsResource(Resource):
    """Resource for managing applications."""

    @staticmethod
    @auth.require
    @profiletime
    def get():  # pylint:disable=too-many-locals
        """Get applications.

        : Id:- List the application for particular id
        : applicationName:- Retrieve application list based on application name
        : applicationStatus:- List all applications based on status
        : createdBy:- To retrieve applications based on createdby
        : created:- Retrieve the applications based on date and time
        : modified:- Retrieve the applications based on modified date and time
        : pageNo:- To retrieve page number
        : limit:- To retrieve limit for each page
        : orderBy:- Name of column to order by (default: id)
        """
        try:
            dict_data = ApplicationListRequestSchema().load(request.args) or {}
            page_no = dict_data.get("page_no")
            limit = dict_data.get("limit")
            order_by = dict_data.get("order_by", "id")
            application_id = dict_data.get("application_id")
            application_name = dict_data.get("application_name")
            application_status = dict_data.get("application_status")
            created_by = dict_data.get("created_by")
            created_from_date = dict_data.get("created_from_date")
            created_to_date = dict_data.get("created_to_date")
            modified_from_date = dict_data.get("modified_from_date")
            modified_to_date = dict_data.get("modified_to_date")
            sort_order = dict_data.get("sort_order", "desc")
            if auth.has_role([REVIEWER_GROUP]):
                (
                    application_schema_dump,
                    application_count,
                    draft_count,
                ) = ApplicationService.get_auth_applications_and_count(
                    created_from=created_from_date,
                    created_to=created_to_date,
                    modified_from=modified_from_date,
                    modified_to=modified_to_date,
                    order_by=order_by,
                    sort_order=sort_order,
                    created_by=created_by,
                    application_id=application_id,
                    application_name=application_name,
                    application_status=application_status,
                    token=request.headers["Authorization"],
                    page_no=page_no,
                    limit=limit,
                )
            else:
                (
                    application_schema_dump,
                    application_count,
                    draft_count,
                ) = ApplicationService.get_all_applications_by_user(
                    page_no=page_no,
                    limit=limit,
                    order_by=order_by,
                    sort_order=sort_order,
                    created_from=created_from_date,
                    created_to=created_to_date,
                    modified_from=modified_from_date,
                    modified_to=modified_to_date,
                    created_by=created_by,
                    application_id=application_id,
                    application_name=application_name,
                    application_status=application_status,
                )
            applications = ApplicationService.get_submission_for_application(application_schema_dump)
            return (
                (
                    {
                        "applications": applications,
                        "totalCount": application_count,
                        "draftCount": draft_count,
                        "limit": limit,
                        "pageNo": page_no,
                    }
                ),
                HTTPStatus.OK,
            )
        except ValidationError as err:
            response, status = (
                {
                    "type": "Invalid Request Object",
                    "message": "Required fields are not passed",
                },
                HTTPStatus.BAD_REQUEST,
            )

            current_app.logger.critical(response)
            current_app.logger.critical(err)
            return response, status

        except KeyError as err:
            response, status = (
                {
                    "type": "Invalid Request Object",
                    "message": "Required fields are not passed",
                },
                HTTPStatus.BAD_REQUEST,
            )
            current_app.logger.critical(response)
            current_app.logger.critical(err)
            return response, status


@cors_preflight("GET,PUT,DELETE,OPTIONS")
@API.route("/<int:application_id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
class ApplicationResourceById(Resource):
    """Resource for getting application by id."""

    @staticmethod
    @auth.require
    @profiletime
    def get(application_id: int):
        """Get application by id.

        : application_id:- List the application for particular application_id
        """
        try:
            if auth.has_role([REVIEWER_GROUP]):
                (
                    application_schema_dump,
                    status,
                ) = ApplicationService.get_auth_by_application_id(
                    application_id=application_id,
                    token=request.headers["Authorization"],
                )
                return (
                    application_schema_dump,
                    status,
                )
            application, status = ApplicationService.get_application_by_user(
                application_id=application_id
            )
            return (application, status)
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to form id - {application_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @auth.require
    @profiletime
    def put(application_id: int):
        """Update application details.

        : application_id:- Update the application for particular application_id
        """
        application_json = request.get_json()
        try:
            application_schema = ApplicationUpdateSchema()
            dict_data = application_schema.load(application_json)
            form_url = dict_data.get("form_url", None)
            if form_url:
                (
                    latest_form_id,
                    submission_id,
                ) = get_form_and_submission_id_from_form_url(form_url)
                dict_data["latest_form_id"] = latest_form_id
                dict_data["submission_id"] = submission_id
            ApplicationService.update_application(
                application_id=application_id, data=dict_data
            )
            return "Updated successfully", HTTPStatus.OK
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to application-{application_id} is prohibited.",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status

        except BaseException as submission_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(submission_err)

            return response, status

    @staticmethod
    @auth.require
    @profiletime
    @auth.has_one_of_bpm_roles(["camunda-client"])
    def delete(application_id):
        """Delete application by id."""
        try:
            ApplicationService.delete_application(application_id)
            return "Deleted", HTTPStatus.OK
        except BusinessException as err:
            response, status = (
                {
                    "type": "Invalid response data",
                    "message": f"Invalid application id - {application_id}",
                },
                HTTPStatus.BAD_REQUEST,
            )

            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/formid/<string:form_id>", methods=["GET", "OPTIONS"])
class ApplicationResourceByFormId(Resource):
    """Resource for getting applications based on formid."""

    @staticmethod
    @auth.require
    @profiletime
    def get(form_id: str):
        """Get applications.

        : form_id:- Retrieve application list based on formid
        """
        if request.args:
            dict_data = ApplicationListReqSchema().load(request.args)
            page_no = dict_data["page_no"]
            limit = dict_data["limit"]
        else:
            page_no = 0
            limit = 0

        if auth.has_role(["formsflow-reviewer"]):
            application_schema = ApplicationService.get_all_applications_form_id(
                form_id=form_id, page_no=page_no, limit=limit
            )
            application_count = ApplicationService.get_all_applications_form_id_count(
                form_id=form_id
            )
        else:
            application_schema = ApplicationService.get_all_applications_form_id_user(
                form_id=form_id,
                page_no=page_no,
                limit=limit,
            )
            application_count = (
                ApplicationService.get_all_applications_form_id_user_count(
                    form_id=form_id
                )
            )

        if page_no == 0:
            return (
                (
                    {
                        "applications": application_schema,
                        "totalCount": application_count,
                    }
                ),
                HTTPStatus.OK,
            )
        return (
            (
                {
                    "applications": application_schema,
                    "totalCount": application_count,
                    "limit": limit,
                    "pageNo": page_no,
                }
            ),
            HTTPStatus.OK,
        )


@cors_preflight("POST,OPTIONS")
@API.route("/create", methods=["POST", "OPTIONS"])
class ApplicationResourcesByIds(Resource):
    """Resource for application creation."""

    @staticmethod
    @auth.require
    @profiletime
    def post():
        """Post a new application using the request body.

        : formId:- Unique Id for the corresponding form
        : submissionId:- Unique Id for the submitted form
        : formUrl:- Unique URL for the submitted application
        """
        application_json = request.get_json()

        try:
            application_schema = ApplicationSchema()
            dict_data = application_schema.load(application_json)
            application, status = ApplicationService.create_application(
                data=dict_data, token=request.headers["Authorization"]
            )
            response = application_schema.dump(application)
            return response, status
        except PermissionError as err:
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to formId-{dict_data['form_id']} is prohibited",
                },
                HTTPStatus.FORBIDDEN,
            )
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status
        except KeyError as err:
            response, status = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status
        except BaseException as application_err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(application_err)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("/status/list", methods=["GET", "OPTIONS"])
class ApplicationResourceByApplicationStatus(Resource):
    """Get application status list."""

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """Method to get the application status lists."""
        try:
            return (
                ApplicationService.get_all_application_status(),
                HTTPStatus.OK,
            )
        except BusinessException as err:
            return err.error, err.status_code

@cors_preflight("DELETE, OPTIONS")
@API.route("/<int:application_id>/delete", methods=["DELETE", "OPTIONS"])
class ApplicationResourceByIdDelete(Resource):
    """Delete application from all DB sources by id."""

    @staticmethod
    @auth.require
    @profiletime
    @user_context
    def delete(application_id, **kwargs):
        """Delete application by id."""
        try:
            application = Application.find_by_id_with_fields(application_id=application_id)
            if not application:
                raise BusinessException(f"Invalid application by id:{application_id}", HTTPStatus.BAD_REQUEST)
            # Ensure only the application owner or an authorized admin role can delete the application
            user: UserContext = kwargs["user"]
            user_id = user.user_name
            user_roles = user._roles
            if application.created_by != user_id and 'formsflow-designer' not in user_roles:
                raise BusinessException(f"User {user_id} is not authorized to delete application {application_id}", HTTPStatus.UNAUTHORIZED)
            # Delete application from webApi
            ApplicationService.delete_application(application_id)
            # Delete application's submission from formio
            ApplicationService.delete_submission_by_application(application)
            # Delete applications's process_instance from Camunda
            if application.process_instance_id:
                token = request.headers["Authorization"]
                ApplicationService.delete_process_instance(application.process_instance_id, token)
            # Delete from external sources depending on the process_key
            sl_review_process_key = current_app.config.get("SL_REVIEW_PROCESS_KEY")
            influenza_worksite_process_key = current_app.config.get("INFLUENZA_WORKSITE_PROCESS_KEY")
            if application.process_key == influenza_worksite_process_key:
                InfluenzaService.delete_worksites_registrations(application_id)
            if application.process_key == sl_review_process_key:
                ApplicationService.delete_application_from_ODS(application_id)
            return f"Application was successfully deleted from all DB sources with id: {application_id}", HTTPStatus.OK
        except BusinessException as err:
            current_app.logger.error(err.error)
            return err.error, err.status_code