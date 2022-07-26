package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.*;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import javax.inject.Named;


@Named("DeleteCompletedSubmissionListener")
public class DeleteCompletedSubmissionListener extends BaseListener implements TaskListener, ExecutionListener {

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            deleteSubmission(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            deleteSubmission(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
    }

    private void deleteSubmission(DelegateExecution execution) throws IOException {
        try {
            String formUrl = String.valueOf(execution.getVariables().get("formUrl"));
            formSubmissionService.deleteSubmission(formUrl);    
        } catch (Exception e) {
            System.out.println("Error deleting submission: " + e.getMessage());
            e.printStackTrace();
        }    
    }
}