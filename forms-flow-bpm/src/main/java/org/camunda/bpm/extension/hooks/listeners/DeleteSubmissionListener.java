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
public class DeleteSubmissionListener extends BaseListener implements JavaDelegate {

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        try {
            String formName = String.valueOf(execution.getVariables().get("formName"));
            // #672 & #1488 please remove below consition after 01/21/2024
            if (!formName.equals("Senior Leadership Review Form")) {
                System.out.println("Start deleting submission and application");
                deleteSubmission(execution);
                deleteApplication(execution);
            }
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    private void deleteSubmission(DelegateExecution execution) throws IOException {
        String formUrl = String.valueOf(execution.getVariables().get("formUrl"));
        formSubmissionService.deleteSubmission(formUrl);    
    }

    private String getApplicationUrl(DelegateExecution execution){
        return httpServiceInvoker.getProperties().getProperty("api.url")+"/application/"+execution.getVariable("applicationId");
    }

    private void deleteApplication(DelegateExecution execution) throws IOException {
        String applicationUrl = getApplicationUrl(execution);
        ObjectMapper objectMapper = new ObjectMapper();
        ResponseEntity<String> response = httpServiceInvoker.execute(applicationUrl, HttpMethod.DELETE, null);
        if (response.getStatusCode().value() == HttpStatus.OK.value()) {
            System.out.println("Application was deleted successfully: " + applicationUrl);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
        } else if (response.getStatusCode().value() == HttpStatus.BAD_REQUEST.value()) {
            System.out.println("Application was not found for deletion! " +  applicationUrl);
        } else {
            throw new ApplicationServiceException("Unable to delete application for: " + applicationUrl + ". Message Body: " +
                    response.getBody());
        }
    }
}