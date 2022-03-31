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
    private final static Logger LOGGER = LoggerFactory.getLogger(SendSubmissionToODSDelegate.class);

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

        LOGGER.warn(String.format("Sending values of form to ODS %s", formUrl));

        if(formUrl == null || formUrl.length() == 0) {
            return;
        }

        Object idir = execution.getVariable("IDIR");
        Object guid = execution.getVariable("GUID");

        Map<String, Object> values = formSubmissionService.retrieveFormValues(formUrl, false);

        if(idir != null) {
            values.put("idir", String.valueOf(idir));
        }

        if(guid != null) {
            values.put("guid", String.valueOf(guid));
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(values);
        String endpoint = (String) execution.getVariableLocal("endpoint");

        this.httpServiceInvoker.execute(getEndpointUrl(endpoint), HttpMethod.POST, json);
    }

    public String getEndpointUrl(String endpoint) {
        return odsUrl + "/" + endpoint;
    }
}
