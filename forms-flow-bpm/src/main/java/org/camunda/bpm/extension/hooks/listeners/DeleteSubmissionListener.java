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

import org.camunda.bpm.extension.hooks.services.FormSubmissionService;



@Named("DeleteSubmissionListener")
public class DeleteSubmissionListener  extends BaseListener implements TaskListener, ExecutionListener {

    private Expression groupPath;

    @Autowired
    private FormSubmissionService formSubmissionService;


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
        String formUrl = String.valueOf(execution.getVariables().get("formUrl"));
        deleteSubmission(formUrl);

        // String submissionUrl = formSubmissionService.getSubmissionUrl(formUrl);
        // System.out.println("submissionUrl: " + submissionUrl);
       
        // String submission = formSubmissionService.readSubmission(formUrl);
        // System.out.println("submission: " + submission);

    }

    private void deleteSubmission(String formUrl) {
        try {
            formSubmissionService.deleteSubmission(formUrl);    
        } catch (Exception e) {
            System.out.println("Error deleting submission: " + e.getMessage());
            e.printStackTrace();
        }
        
    }
}