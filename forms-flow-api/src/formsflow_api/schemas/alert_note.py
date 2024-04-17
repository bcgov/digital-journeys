"""This manages draft Response Schema."""
from marshmallow import EXCLUDE, Schema, fields


class AlertNoteSchema(Schema):
    """This class manages alert note schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int(data_key="id")
    created = fields.Str()
    modified = fields.Str()
    contenttype = fields.Str()
    contentdata = fields.Str()
    content = fields.Str()
    is_active = fields.Bool()
    start_date = fields.Str()
    end_date = fields.Str()
