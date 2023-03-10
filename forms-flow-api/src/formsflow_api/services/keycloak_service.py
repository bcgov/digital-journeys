"""Keycloak connect and operations services for import data."""
from http import HTTPStatus
from marshmallow.exceptions import ValidationError
from flask import current_app
from formsflow_api.services.factory import KeycloakFactory
from formsflow_api.schemas import (
    KeycloakResponseSchema, KeycloakUserSchema,
    RequestUserSchema
)

class KeycloakService:  # pylint: disable=too-few-public-methods
    """This class manages keycloak service."""

    def __init__(self):
        """Initialize client."""
        self.client = KeycloakFactory.get_instance()
    
    def get_group_id(self, name):
        """fetch user from group name"""
        try:
            group = self.client.get_group_by_name(name)
            return group.get('id')
        except:
            return None
    
    def get_user_id(self, username):
        """fetch user from username, exact match"""
        users = self.client.get_user_by_username(
            username = username
        )
        userId = None
        if len(users) > 0:
            userId = users[0]["id"]
        return userId

    def get_user_or_add(self, userData):
        """get user and if not exist and add new one"""
        result = KeycloakResponseSchema().load({})
        try:
            userData = RequestUserSchema().load(userData)
        except ValidationError as e:
            fields = ",".join(e.messages.keys())
            result["message"] = f"{fields} fields required with valid data"
            return result

        username = userData.get("email")
        idp = userData.get("idp")
        if idp and idp !="":
            username = f"{username}_{idp}"
        userData["username"] = username
        userData["enabled"] = True
        userId = self.get_user_id(username)
        if not userId:
            status, res = self.client.create_user(
                user = KeycloakUserSchema().load(userData)
            )
            current_app.logger.debug("add user, status: {status}")
            if status == 201:
                userId = self.get_user_id(username)
                result["message"] = "success"
                result["status"] = "true"
            else:
                result["message"] = f"Failed to create user with status: {status}"
        else:
            current_app.logger.debug(f"get user {userId}")
            result["message"] = "success"
            result["status"] = "true"

        result["user_id"] = userId
        result.update(userData)
        return result

    def add_user_group(self, groupId, userData):
        """Add user and assign group"""
        result = self.get_user_or_add(userData)
        if result["user_id"]:
            try:
                userGroup = self.client.add_user_to_group(
                    user_id = result["user_id"],
                    group_id = groupId
                )
                result["user_group"] = userGroup
            except Exception as e:
                result["user_group"] = str(e)
        return result

    def add_users(self, group, data):
        """Process all users data."""
        results = []
        # fetch group and return faild if not found
        groupId = self.get_group_id(group)
        if groupId:
            for user in data:
                result = self.add_user_group(groupId, user)
                user.update(result)
                results.append(user)
        return results, groupId
