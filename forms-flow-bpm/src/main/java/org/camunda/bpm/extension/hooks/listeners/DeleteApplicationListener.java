package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;


@Component
public class DeleteApplicationListener extends BaseListener implements ExecutionListener, TaskListener {


    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            deleteApplication(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            deleteApplication(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
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
