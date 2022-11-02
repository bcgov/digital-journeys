"""This manages Release Note Database Models."""

from __future__ import annotations

from sqlalchemy import and_

from .audit_mixin import AuditDateTimeMixin
from .base_model import BaseModel
from .db import db
from .release_note_map_user import ReleaseNoteMapUser


class ReleaseNote(AuditDateTimeMixin, BaseModel, db.Model):
    """This class manages release note information."""

    __tablename__ = "release_note"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), nullable=True)
    content = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    @classmethod
    def create_release_note_from_dict(cls, release_note_info: dict) -> ReleaseNote:
        """Create new release note."""
        if release_note_info:
            release_note = ReleaseNote()
            release_note.title = release_note_info["title"]
            release_note.content = release_note_info["content"]
            release_note.save()
            return release_note
        return None
    @classmethod
    def list_release_notes(cls) -> ReleaseNote:
        """list release notes."""
        return (
            cls.query.filter(
                ReleaseNote.is_active == True
            )
            .order_by((ReleaseNote.created))
            .all()
        )  # pylint: disable=no-member
    
    @classmethod
    def find_unread_release_note(cls, user_id) -> ReleaseNote:
        """Find unread release note for user."""
        return (
            cls.query.filter(
                and_(
                    ReleaseNote.id.not_in(
                    ReleaseNoteMapUser.query
                    .with_entities(ReleaseNoteMapUser.release_note_id)
                    .filter(ReleaseNoteMapUser.read_by == user_id)
                    ),
                    ReleaseNote.is_active == True
                )
            )
            .order_by((ReleaseNote.created))
            .limit(1)
            .first()
        )  # pylint: disable=no-member
    
    @classmethod
    def find_release_note_by_id(cls, id) -> ReleaseNote:
        """Find release note by Id"""
        return (
            cls.query.get(id)
        )  # pylint: disable=no-member

    def mark_inactive(self):
        """Mark release note inactive"""
        self.is_active = False
        self.commit()
