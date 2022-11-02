"""This exposes release note services."""

from formsflow_api_utils.utils import ANONYMOUS_USER
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.models import ReleaseNote, ReleaseNoteMapUser


class ReleaseNoteService:
    """This class manages release note service."""

    @staticmethod
    def __create_release_note(data):
        """Create new release note entry."""
        return ReleaseNote.create_release_note_from_dict(data)
    
    def __find_release_note_by_id(id):
        """Filter release note using Id"""
        return ReleaseNote.find_release_note_by_id(id)

    @classmethod
    def create_new_release_note(cls, payload):
        """Creates a new release note entry """
        release_note = cls.__create_release_note(payload)

        # if payload contain release_note_id then mark it as deactivated
        if "release_note_id" in payload:
            release_note_obj = cls.__find_release_note_by_id(payload["release_note_id"])
            if release_note_obj:
                release_note_obj.mark_inactive()
        return release_note
    
    @staticmethod
    def list_release_notes():
        """list active release notes."""
        return ReleaseNote.list_release_notes()

    @staticmethod
    @user_context
    def get_unread_release_note(**kwargs):
        """Retrive unread release note for loggedin user"""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name or ANONYMOUS_USER
        return ReleaseNote.find_unread_release_note(user_id)
    
    @classmethod
    @user_context
    def release_note_read_by_user(cls, payload, **kwargs):
        """Creates a new release note entry """
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name or ANONYMOUS_USER
        payload["read_by"] = user_id
        release_note = ReleaseNoteMapUser.create_release_user_map_from_dict(payload)
        return release_note
