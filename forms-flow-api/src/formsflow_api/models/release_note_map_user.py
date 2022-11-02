"""This manages Release Note Read by User Database Models."""

from __future__ import annotations

from .audit_mixin import AuditDateTimeMixin
from .base_model import BaseModel
from .db import db


class ReleaseNoteMapUser(AuditDateTimeMixin, BaseModel, db.Model):
    """This class maps user's with the release note"""
    __tablename__ = "release_note_map_user"
    id = db.Column(db.BigInteger, primary_key=True)
    read_by = db.Column(db.String(256), nullable=False)
    release_note_id = db.Column(
        db.Integer, db.ForeignKey("release_note.id"), nullable=False
    )

    @classmethod
    def create_release_user_map_from_dict(cls, release_note_user_info: dict) -> ReleaseNoteMapUser:
        """Create new release note read by user entry."""
        if release_note_user_info:
            release_note_map_user = ReleaseNoteMapUser()
            release_note_map_user.read_by = release_note_user_info["read_by"]
            release_note_map_user.release_note_id = release_note_user_info["release_note_id"]
            release_note_map_user.save()
            return release_note_map_user
        return None
