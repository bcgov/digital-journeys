package org.camunda.bpm.extension.hooks.listeners;


import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.core.context.SecurityContextHolder;
import javax.servlet.http.HttpServletRequest;


import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
import org.springframework.util.ObjectUtils;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import net.minidev.json.JSONArray;

import javax.inject.Named;
import java.io.IOException;
import java.util.Map;

/**
 * This class transforms all the form document data into CAM variables
 *
 * @author ji.zhao@telus.com
 */
@Named("ExtractManagerGUID")
public class ExtractManagerGUID  extends BaseListener implements TaskListener, ExecutionListener {

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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        String guid = oidcUser.getClaimAsString("bcgovguid");
        String idir = oidcUser.getClaimAsString("idir");

        execution.setVariable("managerGuid", guid);
        execution.setVariable("managerIdir", idir);    

    }
}
