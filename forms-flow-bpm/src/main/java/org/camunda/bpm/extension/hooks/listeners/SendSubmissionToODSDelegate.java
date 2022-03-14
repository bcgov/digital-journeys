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
import java.util.Map;
import java.util.Properties;

@Named("SendSubmissionToODSDelegate")
public class SendSubmissionToODSDelegate implements JavaDelegate {
    private final static Logger LOGGER = LoggerFactory.getLogger(SendSubmissionToODSDelegate.class);

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Value("${formsflow.ai.ods.url}")
    private String odsUrl;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String formUrl = String.valueOf(execution.getVariable("formUrl"));

        LOGGER.warn(String.format("Sending values of form to ODS %s", formUrl));

        if(formUrl == null || formUrl.length() == 0) {
            return;
        }

        Object idir = execution.getVariable("IDIR");
        Object guid = execution.getVariable("GUID");

        Map<String, Object> values = formSubmissionService.retrieveFormValues(formUrl, false);

        if(idir != null) {
            values.put("IDIR", String.valueOf(idir));
        }

        if(guid != null) {
            values.put("GUID", String.valueOf(guid));
        }

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(values);
        System.out.println(json);

        String endpoint = (String) execution.getVariableLocal("endpoint");

        this.httpServiceInvoker.execute(getEndpointUrl(endpoint), HttpMethod.POST, values);
    }

    public String getEndpointUrl(String endpoint) {
        return odsUrl + "/" + endpoint;
    }
}
