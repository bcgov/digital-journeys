"""Keycloak implementation for keycloak group related operations."""
from typing import Dict

from formsflow_api.services import KeycloakAdminAPIService

from .keycloak_admin import KeycloakAdmin


class KeycloakGroupService(KeycloakAdmin):
    """Keycloak implementation for keycloak group related operations."""

    def __init__(self):
        """Initialize client."""
        self.client = KeycloakAdminAPIService()

    def get_analytics_groups(self, page_no: int, limit: int):
        """Get analytics groups."""
        return self.client.get_analytics_groups(page_no, limit)

    def get_group(self, group_id: str):
        """Get group by group_id."""
        return self.client.get_request(url_path=f"groups/{group_id}")

    def update_group(self, group_id: str, dashboard_id_details: Dict):
        """Update group details."""
        return self.client.update_request(
            url_path=f"groups/{group_id}", data=dashboard_id_details
        )

    def get_group_by_name(self, name: str):
        """Get group by group name."""
        return self.client.get_request(url_path=f"group-by-path/{name}")
    
    def get_user_by_username(self, username: str):
        """Get user by username"""
        return self.client.get_request(url_path=f"users?exact=true&username={username}")
    
    def create_user(self, user: Dict):
        """Add new user"""
        return self.client.create_request(
            url_path=f"users", data=user
        )

    def add_user_to_group(self, user_id: str, group_id):
        """Add user to group"""
        return self.client.update_request(url_path=f"users/{user_id}/groups/{group_id}")
    
    def get_users_group(self, user_id: str):
        """Fetch user's existing groups"""
        return self.client.get_request(url_path=f"users/{user_id}/groups")
