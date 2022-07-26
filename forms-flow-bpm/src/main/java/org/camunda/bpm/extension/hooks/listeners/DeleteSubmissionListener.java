package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.*;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;


import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import org.springframework.stereotype.Component;


@Component
public class DeleteSubmissionListener extends BaseListener implements TaskListener, ExecutionListener {

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            deleteSubmission(execution);
            deleteApplication(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            deleteSubmission(delegateTask.getExecution());
            deleteApplication(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
    }

    private void deleteSubmission(DelegateExecution execution) throws IOException {
        System.out.println("DeleteSubmissionListener.deleteSubmission Started");
        try {
            String formUrl = String.valueOf(execution.getVariables().get("formUrl"));
            formSubmissionService.deleteSubmission(formUrl);    
        } catch (Exception e) {
            System.out.println("Error deleting submission: " + e.getMessage());
            e.printStackTrace();
        }    
    }

    private String getApplicationUrl(DelegateExecution execution){
        return httpServiceInvoker.getProperties().getProperty("api.url")+"/application/"+execution.getVariable("applicationId");
    }

    private void deleteApplication(DelegateExecution execution) throws IOException {
        System.out.println("DeleteApplication started");
        String applicationUrl = getApplicationUrl(execution);
        ObjectMapper objectMapper = new ObjectMapper();
        ResponseEntity<String> response = httpServiceInvoker.execute(applicationUrl, HttpMethod.DELETE, null);
        if (response.getStatusCode().value() == HttpStatus.OK.value()) {
            System.out.println("Application was deleted successfully: " + applicationUrl);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
        } else {
            throw new ApplicationServiceException("Unable to delete application for: " + applicationUrl + ". Message Body: " +
                    response.getBody());
        }
    }
}