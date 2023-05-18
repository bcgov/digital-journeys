# Assign user to specific group on `Keycloak`

It will give a context to how a `developer` can assign a group to provided users on Keycloak in bulk.
- If the provided user exists, it will assign a group.
- If the user does not exist, The user will be created on Keycloak and assigned to a group.

> Only support's identity provider. And it is restricted to IDIR users only.

> For any additional requirements, we can update the logic for the `username` and extend it to other IDP or Non-IDP users.

For easy access, we have added an API. A developer can POST data on a given API. In the future, it can be integrated with Frontend as well.

## Available API endpoints

**Endpoint** : POST /user-group  
**Header** : { "Authorization": "Bearer < *FORM DESIGNER TOKEN* >" }  
**Body**: A json object.
- group: Group name to which we want to assign users.
- users: <user's array>
    - firstName: <user's first name>
    - lastName: <user's last name>
    - email: <user's email>
    - idp: <user's Identity provider>
    (It only supports IDIR for now)

Example,

**Request body**
```json
{
    "group": "sl-review-****",
    "users": [
        {
            "firstName": "John",
            "lastName": "Carter",
            "email": "John.john@gov.bc.ca",
            "idp": "idir"
        },
        ...
    ]
}
```
**Response body**

(You can see 2 users, one with success and one with error message)
```json
[
    {
        "firstName": "Bhumin",
        "lastName": "Maze",
        "email": "bhumin.bhumin@gov.bc.ca",
        "idp": "idir",
        "user_id": "fa******-****-****-9b48-********987a",
        "status": true,
        "user_group": "Updated - users/fa******-****-****-9b48-********987a/groups/ae******-****-****-a674-********684f",
        "message": "success",
        "username": "bhumin.bhumin@gov.bc.ca_idir",
        "enabled": true
    },
    {
        "firstName": "Bhumin",
        "lastName": "Maze",
        "email": "bhumin.bhumin@gov.bc.ca",
        "idp": "bcsc",
        "user_id": null,
        "status": false,
        "user_group": null,
        "message": "Supported IDPs are ('idir',)"
    },
]
```