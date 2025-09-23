
PREVENT_UNSAFE_DB_CONNECTIONS = False

FEATURE_FLAGS = {
    'ENABLE_TEMPLATE_PROCESSING': True
}

JINJA_CONTEXT_ADDONS = {

    'sql_flagged': lambda name: f"""

        WITH {name}_flagged_cte AS (

            SELECT 
                employeeName AS Name, 
                organization AS Organization,
                {name}_flagged AS Terms 
            FROM 
                report 
            WHERE 
                {name}_flagged <> ''
        )

        SELECT *, COUNT(*) AS Occurrences from {name}_flagged_cte GROUP BY Name, Organization
    """,

    'sql_action': lambda name: f"""

        SELECT 
            '{name}' AS Field,
            {name}_action AS Action,
            COUNT(*) AS Occurrences 
        FROM
            report 
        GROUP BY
            {name}_action

    """
}
