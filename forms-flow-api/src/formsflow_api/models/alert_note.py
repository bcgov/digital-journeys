"""This manages Alert Note Database Models."""

from __future__ import annotations
import datetime
from sqlalchemy import and_
from sqlalchemy.dialects.postgresql import JSON

from .audit_mixin import AuditDateTimeMixin
from .base_model import BaseModel
from .db import db


class AlertNote(AuditDateTimeMixin, BaseModel, db.Model):
    """This class manages alert note information."""

    __tablename__ = "alert_note"
    id = db.Column(db.Integer, primary_key=True)
    is_active = db.Column(db.Boolean, default=True)
    contenttype = db.Column(db.String(1024), nullable=True, default='alert alert-info')
    contentdata = db.Column(db.String(64), nullable=True, default='html')
    content = db.Column(db.String(10240), nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    

    @classmethod
    def create_alert_note_from_dict(cls, alert_note_info: dict) -> AlertNote:
        """Create new alert note."""
        if alert_note_info:
            alert_note = AlertNote()
            alert_note.content = alert_note_info["content"]
            if "start_date" in alert_note_info:
                alert_note.start_date = alert_note_info["start_date"]
            if "end_date" in alert_note_info:
                alert_note.end_date = alert_note_info["end_date"]
            if "contenttype" in alert_note_info:
                alert_note.contenttype = alert_note_info["contenttype"]
            if "contentdata" in alert_note_info:
                alert_note.contentdata = alert_note_info["contentdata"]
            alert_note.save()
            return alert_note
        return None

    @classmethod
    def list_alert_notes(cls) -> AlertNote:
        """list alert notes."""
        return (
            cls.query.filter(
                AlertNote.is_active == True
            )
            .order_by((AlertNote.created))
            .all()
        )  # pylint: disable=no-member

    @classmethod
    def find_active_alert_note(cls) -> AlertNote:
        """Find active alert note for to display"""
        return (
            cls.query.filter(
                and_(
                    AlertNote.is_active == True,
                    AlertNote.start_date <= datetime.datetime.utcnow(),
                    AlertNote.end_date >= datetime.datetime.utcnow()
                )
            )
            .order_by((AlertNote.created))
            .limit(1)
            .first()
        )  # pylint: disable=no-member
