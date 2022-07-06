package org.camunda.bpm.extension.hooks.services;

import org.springframework.stereotype.Service;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;



@Service
public class KeycloakClientAdminService {

  static Keycloak keycloak = null;

  public KeycloakClientAdminService() {
  }

  public static Keycloak getInstance(String keycloakUrl, String keycloakRealm, 
    String keycloakClientId, String keycloakClientSecret) {

    if(keycloak == null) {
      keycloak = KeycloakBuilder.builder()
        .serverUrl(keycloakUrl + "/auth")
        .realm(keycloakRealm)
        .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
        .clientId(keycloakClientId)
        .clientSecret(keycloakClientSecret)
        .build();
    }
    return keycloak;
  }
}