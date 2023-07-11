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
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.regex.Pattern;
import java.util.regex.Matcher;


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
        String objectKeycase = String.valueOf(execution.getVariableLocal("objectKeycase"));
        List<String> replaceTextList = (List) execution.getVariableLocal("replaceTextList");
        // List of object keys that should not be flatten on send to ODS
        List<String> flatObjectExclusionList = (List) execution.getVariableLocal("flatObjectExclusionList");
        // If exceptions not defined, set an empty list
        if (flatObjectExclusionList == null) {
            flatObjectExclusionList = new ArrayList<String>();
        }

        LOGGER.warn(String.format("Sending values of form to ODS. Form: %s. ODS Endpoint: %s", formUrl, endpoint));

        if(formUrl == null || formUrl.length() == 0) {
            return;
        }

        Object idir = execution.getVariable("IDIR");
        Object guid = execution.getVariable("GUID");
    
        Object managerIdir = execution.getVariable("manager_idir");
        Object managerGuid = execution.getVariable("manager_guid");
        
        String applicationId = String.valueOf(execution.getVariable("applicationId"));

        Map<String, Object> values = formSubmissionService.retrieveFormValues(formUrl, false, true, flatObjectExclusionList);

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
        String json = "";
        if (objectKeycase.equals("snake_case")) {
            values = convertToSnake(values);
        }
        if (replaceTextList != null) {
            values = replaceTextAll(values, replaceTextList);
        }
        json = objectMapper.writeValueAsString(values);

        boolean debug = Boolean.parseBoolean(String.valueOf(execution.getVariableLocal("debug")));

        if(debug) {
            System.out.println("Sending values to ODS: " + json);
        }

        if (httpMethod.equals("put")) {
            this.httpServiceInvoker.execute(getEndpointUrl(endpoint, applicationId), HttpMethod.PUT, json);
        } else if (httpMethod.equals("delete")) {
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

    public String camelToSnake(String str) {
        String regex = "([a-z])([A-Z]+)";
        return str.replaceAll(regex, "$1_$2").toLowerCase();
    }

    public Map<String, Object> convertToSnake(Map<String, Object> values) {
        Map<String, Object> map = new HashMap<>();
        for (var entry : values.entrySet()) {
            map.put(camelToSnake(entry.getKey()), entry.getValue());
        }
        return map;
    }

    public Map<String, Object> replaceTextAll(Map<String, Object> values, List<String> replaceTextList) {
        Map<String, Object> map = new HashMap<>();
        for (var entry : values.entrySet()) {
            if (entry.getValue() instanceof String) {
                String temp = entry.getValue().toString();
                for (String str : replaceTextList) {
                    String[] replaceArray = str.split(",");
                    if (replaceArray.length > 1) {
                        temp = temp.replaceAll(
                            Pattern.quote(replaceArray[0]), 
                            Matcher.quoteReplacement(replaceArray[1]));
                    }
                }
                map.put(entry.getKey(), temp);
            } else {
                map.put(entry.getKey(), entry.getValue());
            }
        }
        return map;
    }
}
