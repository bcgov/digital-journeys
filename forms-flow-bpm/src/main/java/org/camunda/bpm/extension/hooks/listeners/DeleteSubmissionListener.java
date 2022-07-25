package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.*;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
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

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.camunda.bpm.extension.hooks.listeners.data.Application;





@Named("DeleteSubmissionListener")
public class DeleteSubmissionListener  extends BaseListener implements TaskListener, ExecutionListener {

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Autowired
    private ApplicationStateListener applicationStateListener;


    @Override
    public void notify(DelegateExecution execution) {
        // try {
            // syncFormVariables(execution);
            // invokeApplicationService(execution);
            // System.out.println("before DeleteSubmissionListener.notify() invokeApplicationService 1");
            // applicationStateListener.invokeApplicationService(execution);
        // } catch (IOException e) {
            // handleException(execution, ExceptionSource.EXECUTION, e);
        // }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        // try {
            // syncFormVariables(delegateTask.getExecution());
            // invokeApplicationService(delegateTask.getExecution());
            // System.out.println("before DeleteSubmissionListener.notify() invokeApplicationService 2");
            // applicationStateListener.invokeApplicationService(delegateTask.getExecution());    
        // } catch (IOException e) {
            // handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        // }
    }

    // private void syncFormVariables(DelegateExecution execution) throws IOException {
    //     String formUrl = String.valueOf(execution.getVariables().get("formUrl"));
    //     // deleteSubmission(formUrl);

    //     String applicaitonUrl = getApplicationUrl(execution);
    //     System.out.println("applicaitonUrl: " + applicaitonUrl);
    //     deleteApplication(applicaitonUrl);

    //     // String submissionUrl = formSubmissionService.getSubmissionUrl(formUrl);
    //     // System.out.println("submissionUrl: " + submissionUrl);
       
    //     // String submission = formSubmissionService.readSubmission(formUrl);
    //     // System.out.println("submission: " + submission);

    // }

    // private void deleteSubmission(String formUrl) {
    //     try {
    //         formSubmissionService.deleteSubmission(formUrl);    
    //     } catch (Exception e) {
    //         System.out.println("Error deleting submission: " + e.getMessage());
    //         e.printStackTrace();
    //     }    
    // }
    
    // private void deleteApplication(String applicationUrl) {
    //     try {
    //         System.out.println("deleteApplication listener: " + applicationUrl);
    //         // deleteApplication1(applicationUrl);
    //     } catch (Exception e) {
    //         System.out.println("Error deleting application: " + e.getMessage());
    //         e.printStackTrace();
    //     }    
    // }

    // private String getApplicationUrl(DelegateExecution execution){
    //     return httpServiceInvoker.getProperties().getProperty("api.url")+"/application/"+execution.getVariable("applicationId");
    // }

    // private void deleteApplication1(String applicationUrl) throws IOException {
    //     ObjectMapper objectMapper = new ObjectMapper();
    //     System.out.println("before  httpServiceInvoker.execute");
    //     // ResponseEntity<String> response = httpServiceInvoker.execute(applicationUrl, HttpMethod.DELETE, null);
    //     ResponseEntity<String> response = httpServiceInvoker.execute(applicationUrl, HttpMethod.PUT, null);
    //     System.out.println("after  httpServiceInvoker.execute response: " + response);
    //     if (response.getStatusCode().value() == HttpStatus.OK.value()) {
    //         System.out.println("response.getStatusCode");
    //         JsonNode jsonNode = objectMapper.readTree(response.getBody());
    //         System.out.println("jsonNode: " + jsonNode);
    //     } else {
    //         System.out.println("Unable to delete application for: " + applicationUrl + ". Message Body: " +
    //                 response.getBody());
    //         throw new ApplicationServiceException("Unable to delete application for: " + applicationUrl + ". Message Body: " +
    //                 response.getBody());
    //     }
    // }

    // private void invokeApplicationService(DelegateExecution execution) throws IOException {
    //     System.out.println("before invokeApplicationService");
    //     ResponseEntity<String> response = httpServiceInvoker.execute(getApplicationUrl(execution), HttpMethod.PUT,  prepareApplication(execution));
    //     System.out.println("after invokeApplicationService response: " + response);
    //     if(response.getStatusCodeValue() != HttpStatus.OK.value()) {
    //         throw new ApplicationServiceException("Unable to update application "+ ". Message Body: " +
    //                 response.getBody());
    //     }
    // }

    // /**
    //  * Prepares and returns the Application object.
    //  * @param execution
    //  * @return
    //  */
    // private Application prepareApplication(DelegateExecution execution) {
    //     String applicationStatus = String.valueOf(execution.getVariable("applicationStatus"));
    //     String formUrl = String.valueOf(execution.getVariable("formUrl"));
    //     return new Application(applicationStatus, formUrl);
    // }

}