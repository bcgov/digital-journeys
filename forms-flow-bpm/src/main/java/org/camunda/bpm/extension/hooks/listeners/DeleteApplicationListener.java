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
            System.out.println("in DeleteApplicationListener.notify() 1");
            invokeApplicationService(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            System.out.println("in DeleteApplicationListener.notify() 2");
            invokeApplicationService(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
    }

    /**
     * This method invokes the HTTP service invoker for application.
     *
     * @param execution
     */
    public void invokeApplicationService(DelegateExecution execution) throws IOException {
        String applicaitonUrl = getApplicationUrl(execution);
        deleteApplication(applicaitonUrl);
    }

    private String getApplicationUrl(DelegateExecution execution){
        return httpServiceInvoker.getProperties().getProperty("api.url")+"/application/"+execution.getVariable("applicationId");
    }

    private void deleteApplication(String applicationUrl) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        System.out.println("before  httpServiceInvoker.execute");
        ResponseEntity<String> response = httpServiceInvoker.execute(applicationUrl, HttpMethod.DELETE, null);
        System.out.println("after  httpServiceInvoker.execute response: " + response);
        if (response.getStatusCode().value() == HttpStatus.OK.value()) {
            System.out.println("response.getStatusCode");
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            System.out.println("jsonNode: " + jsonNode);
        } else {
            System.out.println("Unable to delete application for: " + applicationUrl + ". Message Body: " +
                    response.getBody());
            throw new ApplicationServiceException("Unable to delete application for: " + applicationUrl + ". Message Body: " +
                    response.getBody());
        }
    }

}
