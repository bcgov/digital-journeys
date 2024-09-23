package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.*;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.camunda.bpm.extension.hooks.services.KeycloakClientAdminService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

import org.springframework.security.core.context.SecurityContextHolder;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.rest.security.auth.AuthenticationResult;
import org.camunda.bpm.engine.rest.security.auth.impl.ContainerBasedAuthenticationProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.ObjectUtils;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import net.minidev.json.JSONArray;

import javax.inject.Named;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.Map;
import java.util.Arrays;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.RealmRepresentation;
import org.keycloak.representations.idm.GroupRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.GroupsResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.admin.client.resource.UserResource;




@Named("UserGroupAssignmentListener")
public class UserGroupAssignmentListener  extends BaseListener implements TaskListener, ExecutionListener {

    private Expression groupPath;

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Autowired
    private KeycloakClientAdminService keycloakClientAdminService;

    @Value("${keycloak.url}")
    private String keycloakUrl;
    
    @Value("${keycloak.url.realm}")
    private String keycloakRealm;
    
    @Value("${keycloak.clientId}")
    private String keycloakClientId;
    
    @Value("${keycloak.clientSecret}")
    private String keycloakClientSecret;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            syncFormVariables(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            syncFormVariables(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
    }

    private void syncFormVariables(DelegateExecution execution) throws IOException {
        String managerEmail = String.valueOf(execution.getVariables().get("managerEmail"));
        String managerUsername = managerEmail + "_idir";
        String groupPathToBeAdded = String.valueOf(this.groupPath.getValue(execution));
        String givenUsername = String.valueOf(execution.getVariables().get("givenUsername"));

        if (!givenUsername.isEmpty() && givenUsername != null && givenUsername != "" && givenUsername != "null") {
            managerUsername = givenUsername;
        }
        
        if (managerEmail == null || managerEmail.isEmpty() || 
            groupPathToBeAdded == null || groupPathToBeAdded.isEmpty()) {
            System.out.println("Manager email or group path is empty/null");
            return;
        }
    
        Keycloak keycloak = keycloakClientAdminService.getInstance(keycloakUrl, keycloakRealm, keycloakClientId, keycloakClientSecret);
        RealmResource realmResource = keycloak.realm(keycloakRealm);

        if (keycloak == null || realmResource == null) {
            System.out.println("Keycloak or realm resource is null");
            return;
        }

        try {
            UserRepresentation userRepresentation = getUser(managerUsername, realmResource);
            if (userRepresentation == null) {
                // Create a new user with this email
                createKeycloakUser(managerEmail, managerUsername, realmResource);
                
                // Get the created user
                userRepresentation = getUser(managerUsername, realmResource);
                
                if (userRepresentation == null) {
                    System.out.println("User was not found after creation: " + managerUsername);
                    return;
                }
            }

            // Find the user group
            GroupRepresentation retrivedGroup = getGroupByPath(realmResource, groupPathToBeAdded);
            if (retrivedGroup == null || StringUtils.isEmpty(retrivedGroup.getId()) || 
                !retrivedGroup.getPath().equals(groupPathToBeAdded)) {
                System.out.println("The group was not found: " + retrivedGroup);
                return;
            }
            
            // Adding the user to the group
            addUserToGroup(realmResource, userRepresentation, retrivedGroup);

        } catch (RuntimeException e) {
            System.out.println("RuntimeException: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private UserRepresentation getUser(String managerUsername, RealmResource realmResource) throws RuntimeException {
        List<UserRepresentation> userRepresentations = realmResource.users().search(managerUsername, 0, 1);

        if (userRepresentations.size() > 1) {
            System.out.println("More than one user found for username: " + managerUsername);
            throw new RuntimeException("More than one user found for username: " + managerUsername);
        } else if (userRepresentations.size() == 0) { 
            System.out.println("No user found by username: " + managerUsername);
            return null;
        } 
        
        UserRepresentation userRepresentation = userRepresentations.get(0);
        return userRepresentation;
    }

    private void createKeycloakUser(String managerEmail, String managerUsername, RealmResource realmResource) throws RuntimeException {
        UserRepresentation userRepresentation = new UserRepresentation();
        userRepresentation.setUsername(managerUsername);
        userRepresentation.setEmail(managerEmail);
        userRepresentation.setEnabled(true) ;
        Response response = realmResource.users().create(userRepresentation);
        if (response.getStatus() == 201) {
            System.out.println("User created");
        } else {
            System.out.println("User creation failed: " + response.getStatus() + response.getStatusInfo().getReasonPhrase());
            throw new RuntimeException("User creation failed: " + response.getStatus() + response.getStatusInfo().getReasonPhrase());
        }
    }

    private GroupRepresentation getGroupByPath(RealmResource realmResource, String groupPath) {
        String groupParentPath = "/" + groupPath.split("/")[1];

        GroupsResource groupsResource = realmResource.groups();
        List<GroupRepresentation> groupRepresentations = groupsResource.groups();
        GroupRepresentation retrivedGroup = null;
        for (GroupRepresentation group : groupRepresentations) {
            if (group.getPath().equals(groupParentPath)) {
                List<GroupRepresentation> subgroup = group.getSubGroups();
                for (GroupRepresentation sub : subgroup) {
                    if (sub.getPath().equals(groupPath)) {
                        retrivedGroup = sub;
                    }
                }
            }
        }
        return retrivedGroup;
    }

    private void addUserToGroup(RealmResource realmResource, UserRepresentation user, GroupRepresentation groupToBeAdded) {
        UserResource userResource = realmResource.users().get(user.getId());
        List<GroupRepresentation> userGroups = userResource.groups();
        List<GroupRepresentation> matchingGroups = userGroups.stream().filter(el -> el.getId().equals(groupToBeAdded.getId())).collect(Collectors.toList());

        if (matchingGroups.size() > 0) {
            return;
        }
        userResource.joinGroup(groupToBeAdded.getId());
        System.out.println("group: " + groupToBeAdded.getPath() + " was successfully added to user: " + user.getUsername());
    }
}