"""This exposes alert note services."""

from formsflow_api.models import AlertNote


class AlertNoteService:
    """This class manages alert note service."""

    @staticmethod
    def __create_alert_note(data):
        """Create new alert note entry."""
        return AlertNote.create_alert_note_from_dict(data)

    @classmethod
    def create_new_alert_note(cls, payload):
        """Creates a new alert note entry """
        alert_note = cls.__create_alert_note(payload)
        return alert_note
    
    @staticmethod
    def list_alert_notes():
        """list active alert notes."""
        return AlertNote.list_alert_notes()

    @staticmethod
    def get_active_alert_note(**kwargs):
        """Retrive unread alert note """
        return AlertNote.find_active_alert_note()
