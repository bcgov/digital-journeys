"""This manages draft Response Schema."""
from marshmallow import EXCLUDE, Schema, fields


class ReleaseNoteSchema(Schema):
    """This class manages release note schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int(data_key="id")
    created = fields.Str()
    modified = fields.Str()
    title = fields.Str()
    content = fields.Dict()
    is_active = fields.Bool()
