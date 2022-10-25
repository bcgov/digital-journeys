package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;

import javax.inject.Named;
import java.io.IOException;
import java.util.Map;

@Named("SendSubmissionToODSDelegate")
public class SendSubmissionToODSDelegate extends BaseListener implements JavaDelegate {
    private final static Logger LOGGER = LoggerFactory.getLogger(SendSubmissionToODSDelegate.class.getName());

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Value("${formsflow.ai.ods.url}")
    private String odsUrl;

    @Override
    public void execute(DelegateExecution execution) {
        try {
            this.sendSubmissionToODS(execution);
        } catch (IOException e) {
            handleException(execution, ExceptionSource.EXECUTION, e);
        }
    }

    private void sendSubmissionToODS(DelegateExecution execution) throws IOException {
        String formUrl = String.valueOf(execution.getVariable("formUrl"));
        String endpoint = String.valueOf(execution.getVariableLocal("endpoint"));
        String httpMethod = String.valueOf(execution.getVariableLocal("httpMethod"));

        LOGGER.warn(String.format("Sending values of form to ODS. Form: %s. ODS Endpoint: %s", formUrl, endpoint));

        if(formUrl == null || formUrl.length() == 0) {
            return;
        }

        Object idir = execution.getVariable("IDIR");
        Object guid = execution.getVariable("GUID");
    
        Object managerIdir = execution.getVariable("manager_idir");
        Object managerGuid = execution.getVariable("manager_guid");
        
        String applicationId = String.valueOf(execution.getVariable("applicationId"));

        Map<String, Object> values = formSubmissionService.retrieveFormValues(formUrl, false, true);

        if (idir != null) {
            values.put("idir", String.valueOf(idir));
        }

        if (guid != null) {
            values.put("guid", String.valueOf(guid));
        }

        if (managerIdir != null) {
            values.put("manager_idir", String.valueOf(managerIdir));
        }

        if (managerGuid != null) {
            values.put("manager_guid", String.valueOf(managerGuid));
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(values);

        boolean debug = Boolean.parseBoolean(String.valueOf(execution.getVariableLocal("debug")));

        if(debug) {
            System.out.println("Sending valuse to ODS: " + json);
        }

        if (httpMethod.equals("put")) {
            this.httpServiceInvoker.execute(getEndpointUrl(endpoint, applicationId), HttpMethod.PUT, json);
        } if (httpMethod.equals("delete")) {
            this.httpServiceInvoker.execute(getEndpointUrl(endpoint, applicationId), HttpMethod.DELETE, json);
        } else {
            this.httpServiceInvoker.execute(getEndpointUrl(endpoint), HttpMethod.POST, json);
        }
        LOGGER.warn(String.format("Sent values of form to ODS. Form: %s. ODS Endpoint: %s", formUrl, endpoint));
    }

    public String getEndpointUrl(String endpoint) {
        return odsUrl + "/" + endpoint;
    }
    
    public String getEndpointUrl(String endpoint, String applicationId) {
        return odsUrl + "/" + endpoint + "(" + applicationId + ")";
    }
}
