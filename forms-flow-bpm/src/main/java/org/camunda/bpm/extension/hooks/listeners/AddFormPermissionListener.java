package org.camunda.bpm.extension.hooks.listeners;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.*;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;

import javax.inject.Named;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This class adds permissions to the given form submission to the given user.
 *
 * Permissions:
 * - write
 * - read
 * - update
 *
 */
@Named("AddFormPermissionListener")
public class AddFormPermissionListener  extends BaseListener implements TaskListener, ExecutionListener {

    private Expression permissions;
    private Expression user;
    static final Logger LOGGER = LoggerFactory.getLogger(AddFormPermissionListener.class.getName());

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Override
    public void notify(DelegateExecution execution) {
        try {
            addFormPermission(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            addFormPermission(delegateTask.getExecution());
        } catch (IOException e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }
    }

    private void addFormPermission(DelegateExecution execution) throws IOException {
        ObjectMapper mapper = new ObjectMapper();

        String formUrl = String.valueOf(execution.getVariables().get("formUrl"));
        List<String> permissions =  this.permissions != null && this.permissions.getValue(execution) != null ?
                mapper.readValue(String.valueOf(this.permissions.getValue(execution)), List.class): null;

        String user =  this.user != null && this.user.getValue(execution) != null ?
                String.valueOf(this.user.getValue(execution)): null;

        String submissionId = formSubmissionService.grantSubmissionAccess(formUrl, user, permissions);

        
        // Update execution with variables to see what permissions were given
        execution.setVariable("permissionUser", user);
        execution.setVariable("permissions", permissions);
        execution.setVariable("permissionSubmission", submissionId);
    }

    private String getSubmissionUrl(String formUrl){
        return formUrl;
    }

}
