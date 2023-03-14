"""This manages keycloak services Schema."""

from marshmallow import EXCLUDE, Schema, fields



class KeycloakResponseSchema(Schema):
    """This class manages aggregated response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    user_id = fields.Str(load_default=None)
    status = fields.Boolean(load_default=False)
    message = fields.Str(load_default=None)
    user_group = fields.Str(load_default=None)


class KeycloakUserSchema(Schema):
    """This class manages aggregated keycloak user schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    firstName = fields.Str(required=True)
    lastName = fields.Str(required=True)
    email = fields.Str(required=True)
    username = fields.Str(required=True)
    enabled = fields.Boolean(required=True)


class RequestUserSchema(Schema):
    """This class manages aggregated user request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    firstName = fields.Str(required=True)
    lastName = fields.Str(required=True)
    email = fields.Str(required=True)
    idp = fields.Str(required=True)