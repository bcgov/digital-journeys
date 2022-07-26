package org.camunda.bpm.extension.hooks.services;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.variable.Variables;
import org.camunda.bpm.engine.variable.value.FileValue;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.commons.connector.support.FormTokenAccessHandler;
import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;


@Qualifier("formSubmissionService")
@Service
public class FormSubmissionService {

    private final Logger LOGGER = Logger.getLogger(FormSubmissionService.class.getName());

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Autowired
    private FormTokenAccessHandler formTokenAccessHandler;

    public String readSubmission(String formUrl) {
        ResponseEntity<String> response = httpServiceInvoker.execute(formUrl, HttpMethod.GET, null);
        if (response.getStatusCode().value() == HttpStatus.OK.value()) {
            return response.getBody();
        } else {
            throw new FormioServiceException("Unable to read submission for: " + formUrl + ". Message Body: " +
                    response.getBody());
        }
    }

    public String createRevision(String formUrl) throws IOException {
        String submission = readSubmission(formUrl);
        if (StringUtils.isBlank(submission)) {
            LOGGER.log(Level.SEVERE, "Unable to read submission for " + formUrl);
            return null;
        }
        ObjectMapper objectMapper = new ObjectMapper();
        ResponseEntity<String> response = httpServiceInvoker.execute(getSubmissionUrl(formUrl), HttpMethod.POST, submission);
        if (response.getStatusCode().value() == HttpStatus.CREATED.value()) {
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            String submissionId = jsonNode.get("_id").asText();
            return submissionId;
        } else {
            throw new FormioServiceException("Unable to create revision for: " + formUrl + ". Message Body: " +
                    response.getBody());
        }
    }

    public String createSubmission(String formUrl, String submission) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        ResponseEntity<String> response = httpServiceInvoker.execute(getSubmissionUrl(formUrl), HttpMethod.POST, submission);
        if (response.getStatusCode().value() == HttpStatus.CREATED.value()) {
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            String submissionId = jsonNode.get("_id").asText();
            return submissionId;
        } else {
            throw new FormioServiceException("Unable to create submission for: " + formUrl + ". Message Body: " +
                    response.getBody());
        }
    }

    public void deleteSubmission(String submissionUrl) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        ResponseEntity<String> response = httpServiceInvoker.execute(submissionUrl, HttpMethod.DELETE, null);
        if (response.getStatusCode().value() == HttpStatus.OK.value()) {
            System.out.println("Submission was deleted successfully: " +  submissionUrl);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
        } else {
            throw new FormioServiceException("Unable to delete submission for: " + submissionUrl + ". Message Body: " +
                    response.getBody());
        }
    }

    public String grantSubmissionAccess(String formUrl, String user, List<String> permissions) throws IOException {
        String submission = readSubmission(formUrl);

        if (StringUtils.isBlank(submission)) {
            LOGGER.log(Level.SEVERE, "Grant Access: Unable to read submission for " + formUrl);
            return null;
        }

        ObjectMapper mapper = getObjectMapper();

        JsonNode accessNode = null;

        if (StringUtils.isNotEmpty(submission)) {

            try {
                JsonNode dataNode = mapper.readTree(submission);
                accessNode = dataNode.get("access");

                if (accessNode == null || !accessNode.isArray()) {
                    return null;
                } else {
                    JsonNode finalAccessNode = accessNode;
                    permissions.forEach(permission -> {
                        ObjectNode newPermission = mapper.createObjectNode();
                        newPermission.put("type", permission);
                        newPermission.set("resources", mapper.createArrayNode().add(user));
                        ((ArrayNode) finalAccessNode).add(newPermission);
                    });
                }
            } catch (JsonProcessingException e) {
                throw new FormioServiceException("Unable to update permissions for: " + formUrl + ". Failed to parse access node");
            }
        } else {
            return null;
        }


        JsonNode toUpdate = mapper.createObjectNode().set("access", accessNode);

        ResponseEntity<String> response = httpServiceInvoker.execute(formUrl, HttpMethod.PUT, toUpdate);

        if (response.getStatusCode().value() == HttpStatus.OK.value()) {
            try {
                JsonNode jsonNode = mapper.readTree(response.getBody());
                String submissionId = jsonNode.get("_id").asText();
                return submissionId;
            } catch (JsonProcessingException e) {
                LOGGER.log(Level.SEVERE, "Unable to update permissions for " + formUrl);

                throw new FormioServiceException("Unable to read permissions for: " + formUrl + ". Message Body: " +
                        response.getBody());
            }
        } else {
            LOGGER.log(Level.SEVERE, "Unable to update permissions for " + formUrl);

            throw new FormioServiceException("Unable to update permissions for: " + formUrl + ". Message Body: " +
                    response.getBody());
        }
    }

    public String getFormIdByName(String formUrl) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        ResponseEntity<String> response = httpServiceInvoker.execute(formUrl, HttpMethod.GET, null);
        if (response.getStatusCode().value() == HttpStatus.OK.value()) {
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            String formId = jsonNode.get("_id").asText();
            return formId;
        } else {
            throw new FormioServiceException("Unable to get name for: " + formUrl + ". Message Body: " +
                    response.getBody());
        }
    }

    public String getSubmissionUrl(String formUrl) {
        if (StringUtils.endsWith(formUrl, "submission")) {
            return formUrl;
        }
        return StringUtils.substringBeforeLast(formUrl, "/");
    }

    public Map<String,Object> retrieveFormValues(String formUrl) throws IOException {
        return this.retrieveFormValues(formUrl, true);
    }

    public Map<String,Object> retrieveFormValues(String formUrl, boolean withFileInfo) throws IOException {
        Map<String,Object> fieldValues = new HashMap();
        String submission = readSubmission(formUrl);
        if (StringUtils.isNotEmpty(submission)) {
            JsonNode dataNode = getObjectMapper().readTree(submission);
            Iterator<Map.Entry<String, JsonNode>> dataElements = dataNode.findPath("data").fields();
            while (dataElements.hasNext()) {
                Map.Entry<String, JsonNode> entry = dataElements.next();

                if(!withFileInfo && entry.getValue() != null 
                    && entry.getValue().isArray() 
                    && entry.getValue().get(0) != null 
                    && entry.getValue().get(0).has("originalName")) {
                    // Replace any file array values with a comma separated list of file names
                    ArrayNode vals = (ArrayNode) entry.getValue();
                    String fileNames = StreamSupport.stream(vals.spliterator(), false)
                            .map(n -> n.get("originalName").asText())
                            .collect(Collectors.joining(", "));
                    fieldValues.put(entry.getKey(), fileNames);
                } else if(!withFileInfo && entry.getValue() != null && entry.getValue().asText().startsWith("data:image/png")) {
                    // Replace any inline files with the type of image (signatures)
                    fieldValues.put(entry.getKey(), "data:image/png");
                } else if(StringUtils.endsWithIgnoreCase(entry.getKey(),"_file")) {
                    List<String> fileNames = new ArrayList();
                    if (entry.getValue().isArray()) {
                        for (JsonNode fileNode : entry.getValue()) {
                            byte[] bytes = Base64.getDecoder().decode(StringUtils.substringAfterLast(fileNode.get("url").asText(), "base64,"));
                            FileValue fileValue = Variables.fileValue(fileNode.get("originalName").asText())
                                    .file(bytes)
                                    .mimeType(fileNode.get("type").asText())
                                    .create();
                            fileNames.add(fileNode.get("originalName").asText());
                            fieldValues.put(StringUtils.substringBeforeLast(fileNode.get("originalName").asText(), ".") + entry.getKey(), fileValue);
                            if (fileNames.size() > 0) {
                                fieldValues.put(entry.getKey() + "_uploadname", StringUtils.join(fileNames, ","));
                            }
                        }
                    }
                } else {
                    fieldValues.put(entry.getKey(), convertToOriginType(entry.getValue()));
                }
            }
        }
        return fieldValues;
    }

    public JSONObject retrieveFormJson(String formUrl) throws IOException {
        Map<String, Object> fieldValues = new HashMap();
        String submission = readSubmission(formUrl);
        JSONObject json = null;
        if (StringUtils.isNotEmpty(submission)) {
            json = new JSONObject(submission);
        }
        return json;
    }


    private Object convertToOriginType(JsonNode value) throws IOException {
        Object fieldValue;
        if (value.isNull()) {
            fieldValue = null;
        } else if (value.isBoolean()) {
            fieldValue = value.booleanValue();
        } else if (value.isInt()) {
            fieldValue = value.intValue();
        } else if (value.isBinary()) {
            fieldValue = value.binaryValue();
        } else if (value.isLong()) {
            fieldValue = value.asLong();
        } else if (value.isDouble()) {
            fieldValue = value.asDouble();
        } else if (value.isBigDecimal()) {
            fieldValue = value.decimalValue();
        } else if (value.isTextual()) {
            fieldValue = value.asText();
        } else {
            fieldValue = value.toString();
        }

        if (Objects.equals(fieldValue, "")) {
            fieldValue = null;
        }

        return fieldValue;
    }

    public String createFormSubmissionData(Map<String, Object> bpmVariables) throws IOException {
        Map<String, Map<String, Object>> data = new HashMap<>();
        data.put("data", bpmVariables);
        return getObjectMapper().writeValueAsString(data);
    }


    public String getAccessToken() {
        return formTokenAccessHandler.getAccessToken();
    }

    public ObjectMapper getObjectMapper() {
        return new ObjectMapper();
    }

}
