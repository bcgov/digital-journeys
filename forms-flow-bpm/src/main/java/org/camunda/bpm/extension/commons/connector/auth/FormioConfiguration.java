package org.camunda.bpm.extension.commons.connector.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Formio Configuration.
 * Configuration data for formio.
 */
@Data
@AllArgsConstructor
public class FormioConfiguration {

    /**
     * Formio server userName / email
     */
    public String userName;
    /**
     * Formio server password
     */
    public String password;
    /**
     * Formio token uri
     */
    public String accessTokenUri;
}
