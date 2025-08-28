package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.*;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.model.Attachment;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import main.java.org.camunda.bpm.extension.hooks.model.CrmFileAttachmentPostRequest;
import main.java.org.camunda.bpm.extension.hooks.model.CrmIdObject;
import main.java.org.camunda.bpm.extension.hooks.model.CrmIncidentPostRequest;
import main.java.org.camunda.bpm.extension.hooks.model.CrmIncidentPostResponse;
import main.java.org.camunda.bpm.extension.hooks.model.CrmThread;
import main.java.org.camunda.bpm.extension.hooks.model.CrmLookupNameObject;
import main.java.org.camunda.bpm.extension.hooks.model.CrmAssignedTo;
import main.java.org.camunda.bpm.extension.hooks.model.CrmCustomFields;
import main.java.org.camunda.bpm.extension.hooks.model.CrmC;
import main.java.org.camunda.bpm.extension.hooks.model.CrmReferenceContactPostRequest;
import main.java.org.camunda.bpm.extension.hooks.model.CrmStatusWithType;
import main.java.org.camunda.bpm.extension.hooks.model.CrmIncidentPatchRequest;
import main.java.org.camunda.bpm.extension.hooks.model.CrmFileAttachment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.core.JsonProcessingException;


import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.inject.Named;
import javax.activation.DataSource;

import org.slf4j.*;
import org.camunda.bpm.extension.hooks.services.EmailAttachmentService;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;

import javax.annotation.Resource;

import java.io.InputStream;
import java.io.ByteArrayOutputStream;

@Named("CrmDelegate")
public class CrmDelegate extends BaseListener implements JavaDelegate {
    private final static Logger LOGGER = LoggerFactory.getLogger(CrmDelegate.class.getName());
    private static final String FORM_ID = "formId";
    private static final String SUBMISSION_ID = "submissionId";
    private static final String FORM_URL = "formUrl";
    private static final String INCIDENTS = "incidents";
    private static final String CONTACTS = "contacts";
    private static final String REFERENCE_CONTACT = "CO.reference_contact";
    private static final String ATTACHMENT_FILE_NAME = "attachment.pdf";
    private static final String IDIR_POSTFIX = "@idir";
    private static final String CRM_ID = "crmId";
    private static final String USER_IDIR = "userIdir";
    private static final String CRM_LOOKUP_NAME = "crmLookupName";
    private static final String CRM_MAT_PAT_PRODUCT_LOOKUP_NAME_FIELD = "crmProductLookupName";
    private static final String CRM_MAT_PAT_CATEGORY_LOOKUP_NAME_FIELD = "crmCategoryLookupName";
    private static final String CRM_CATEGORY_LOOKUP_ID_FIELD = "crmCategoryLookupId";
    private static final String CRM_MAT_PAT_STAFF_GROUP_LOOKUP_NAME_FIELD = "crmStaffGroupLookupName";
    private static final String CRM_MAT_PAT_SUBJECT_FIELD = "crmSubject";
    private static final String CRM_INCIDENT_SUBJECT_FIELD = "crmIncidentSubject";
    private static final String CRM_MAT_PAT_SUBMITTER_NAME_FIELD = "submissionDisplayName";
    private static final String CRM_THREAD_TEXT_FIELD = "crmThreadText";
    private static final String CRM_EMPLOYEE_ID_FIELD = "empId";
    private static final String CRM_PRIORITY_DUEDATE_FIELD = "crmPriorityDuedate";
    private static final String CRM_MAT_PAT_ATTACHMENT_FILE_NAME_FIELD = "crmMatPatAttachmentFileNameField";
    private static final String MANAGER_DENIED_STATUS = "managerDeniedStatus";
    private static final String MANAGER_ACTION = "action";
    private static final String DENIED_THREAD_TEXT = "deniedThreadText";
    private static final String CRM_FILE_FIELDS_FROM_FORM = "crmFileFields";
    private static final String CRM_FORM_PDF_ATTACHMENT_NAME = "crmFormPdfAttachmentName";

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Value("${formsflow.ai.crm.url}")
    private String crmUrl;

    @Autowired
    private EmailAttachmentService attachmentService;

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Override
    public void execute(DelegateExecution execution) {
        this.crmOperation(execution);
    }

    private void crmOperation(DelegateExecution execution) {
        System.out.println("Starting CRM operation");
        // Get the formId and submissionId from the formUrl
        String formUrl = String.valueOf(execution.getVariables().get(FORM_URL));
        String userAction = String.valueOf(execution.getVariables().get(MANAGER_ACTION));
        String managerDeniedStatus = String.valueOf(execution.getVariables().get(MANAGER_DENIED_STATUS));
        Map<String, String> ids = extractIds(formUrl);
        String formId = ids.get(FORM_ID);
        String submissionId = ids.get(SUBMISSION_ID);
        
        if (formId == null || submissionId == null) {
            System.out.println("formId or submissionId is null. formUrl: " + formUrl + " formId: " + formId + " submissionId" + submissionId);
            throw new ApplicationServiceException("formId or submissionId is null");
        }

        String crmId = String.valueOf(execution.getVariables().get(CRM_ID));
        Boolean isUpdate = false;
        if (execution.getVariables().get(CRM_ID) != null && !crmId.isEmpty() && !crmId.equals("null")) {
            System.out.println("CRM update conditions met");
            isUpdate = true;
        }
        if (!isUpdate && userAction.equals(managerDeniedStatus)) {
            System.out.println("Application denied no CRM ticket required");
            execution.setVariable(CRM_ID, "");
            execution.setVariable(CRM_LOOKUP_NAME, "");
        } else {
            // Find current user's idir
            String currentUserIdir = null;
            try {
                currentUserIdir = getCurrentUserIdir(execution);
            } catch (IOException e) {
                e.printStackTrace();
                System.out.println("No idir user found! Exception: " + e);
            }
            if (currentUserIdir == null) {
                currentUserIdir = String.valueOf(execution.getVariables().get(USER_IDIR));
            }
            if (currentUserIdir == null) {
                System.out.println("currentUserIdir is null: " + currentUserIdir);
                throw new ApplicationServiceException("currentUserIdir is null");
            }
            
            // Find the manager's contact details in CRM
            Integer managerContactId = getContactIdByIdir(currentUserIdir);
            if (managerContactId == null) {
                System.out.println("managerContactId is null: " + managerContactId);
                throw new ApplicationServiceException("managerContactId is null");
            }
            
            // Find the employee's contact details in CRM
            String employeeId = String.valueOf(execution.getVariables().get(CRM_EMPLOYEE_ID_FIELD));
            Integer employeeContactId = null;
            if (execution.getVariables().get(CRM_EMPLOYEE_ID_FIELD) != null && !employeeId.equals("null")) {
                employeeContactId = getContactIdByEmployeeId(employeeId);
                if (employeeContactId == null) {
                    System.out.println("employeeContactId is null: " + employeeContactId);
                    throw new ApplicationServiceException("employeeContactId is null");
                }
            }
    
            // Create/Update incident in CRM
            CrmIncidentPostResponse crmIncidentPostResponse = createUpdateCrmIncident(managerContactId, execution, isUpdate);
            if (crmIncidentPostResponse == null) {
                System.out.println("crmIncidentPostResponse is null: " + crmIncidentPostResponse);
                throw new ApplicationServiceException("createUpdateCrmIncident failed.");
            }
            Integer crmIncidentId = crmIncidentPostResponse.getId();
            // Saving the CRM incident id and lookupName in form
            execution.setVariable(CRM_ID, crmIncidentId);
            execution.setVariable(CRM_LOOKUP_NAME, crmIncidentPostResponse.getLookupName());
    
            if (crmIncidentId == null) {
                System.out.println("crmIncidentId is null, dependent methods cannot run: addCrmContactReference, generatePDFForForm");
                throw new ApplicationServiceException("crmIncidentId is null, dependent methods cannot run: addCrmContactReference, generatePDFForForm");
            }
    
            // Add the employee as a contact reference to the incident
            if (employeeContactId == null) {
                System.out.println("employeeContactId is null. Skipping addCrmContactReference");
            } else if (isUpdate) {
                System.out.println("This is a CrmUpdate. Skipping addCrmContactReference");
            } else {
                try {
                    addCrmContactReference(employeeContactId, crmIncidentId);
                } catch(Exception e) {
                    System.out.println("addCrmContactReference failed. Exception: " + e);
                    e.printStackTrace();
                }
            }
        }
        
        System.out.println("Finished CRM operation");
    }

    private CrmIncidentPostResponse createUpdateCrmIncident(Integer managerContactId, DelegateExecution execution, Boolean isUpdate) {
        // Loading the CRM fields from the form
        String crmProductLookupName = String.valueOf(execution.getVariables().get(CRM_MAT_PAT_PRODUCT_LOOKUP_NAME_FIELD));
        String crmCategoryLookupName = String.valueOf(execution.getVariables().get(CRM_MAT_PAT_CATEGORY_LOOKUP_NAME_FIELD));
        String crmCategoryIdField = String.valueOf(execution.getVariables().get(CRM_CATEGORY_LOOKUP_ID_FIELD));
        String crmStaffGroupLookupName = String.valueOf(execution.getVariables().get(CRM_MAT_PAT_STAFF_GROUP_LOOKUP_NAME_FIELD));
        String crmSubject = String.valueOf(execution.getVariables().get(CRM_MAT_PAT_SUBJECT_FIELD));
        String submitterDisplayName = String.valueOf(execution.getVariables().get(CRM_MAT_PAT_SUBMITTER_NAME_FIELD));
        String userAction = String.valueOf(execution.getVariables().get(MANAGER_ACTION));
        String managerDeniedStatus = String.valueOf(execution.getVariables().get(MANAGER_DENIED_STATUS));
        String deniedThreadText = String.valueOf(execution.getVariables().get(DENIED_THREAD_TEXT));
        String crmIncidentSubjectField = String.valueOf(execution.getVariables().get(CRM_INCIDENT_SUBJECT_FIELD));
        String crmPriorityDuedate = null;
        if (execution.getVariables().get(CRM_PRIORITY_DUEDATE_FIELD) != null && 
            !String.valueOf(execution.getVariables().get(CRM_PRIORITY_DUEDATE_FIELD)).equals("null")) {
            crmPriorityDuedate = String.valueOf(execution.getVariables().get(CRM_PRIORITY_DUEDATE_FIELD));
        }
        String threadText = String.valueOf(execution.getVariables().get(CRM_THREAD_TEXT_FIELD));
        if (isUpdate && userAction.equals(managerDeniedStatus)) {
            threadText = deniedThreadText;
        }
        if (threadText == null) {
            threadText = "";
        }
        
        String crmIncidentSubject = crmSubject + " for " + submitterDisplayName;
        if (crmIncidentSubjectField != null && !crmIncidentSubjectField.equals("null")) {
            crmIncidentSubject = crmIncidentSubjectField;
        }
        CrmIdObject crmPrimaryContact = new CrmIdObject(managerContactId);
        
        CrmIdObject crmEntryType = new CrmIdObject(4); // lookupName": "Customer Proxy"
        CrmIdObject crmChannel = new CrmIdObject(6); // "lookupName": "CSS Web"
        CrmIdObject crmContentType = new CrmIdObject(2); // "lookupName": "text/html", 1 for "text/plain"
        CrmThread crmThread1 = new CrmThread(threadText, crmEntryType, crmChannel, crmContentType);
        ArrayList<CrmThread> crmThreads = new ArrayList<CrmThread>();
        crmThreads.add(crmThread1);
        CrmLookupNameObject crmProduct = new CrmLookupNameObject(crmProductLookupName);
        CrmLookupNameObject crmStaffGroup = new CrmLookupNameObject(crmStaffGroupLookupName);
        CrmAssignedTo crmAssignedTo = new CrmAssignedTo(crmStaffGroup);
        String crmIncidentStatusLookupName = "Unresolved";
        if (isUpdate) {
            crmIncidentStatusLookupName = "Updated";
        }
        CrmLookupNameObject crmIncidentStatus = new CrmLookupNameObject(crmIncidentStatusLookupName);
        CrmStatusWithType crmStatusWithType = new CrmStatusWithType(crmIncidentStatus);
        CrmC crmC = new CrmC(crmPriorityDuedate);
        CrmCustomFields crmCustomFields = new CrmCustomFields(crmC);
        // CrmIncidentPostRequest crmIncidentPostRequest = new CrmIncidentPostRequest(crmPrimaryContact, crmIncidentSubject, crmThreads, crmProduct, crmCategory, crmAssignedTo, crmCustomFields, crmStatusWithType);
        CrmIncidentPostRequest crmIncidentPostRequest = new CrmIncidentPostRequest(crmPrimaryContact, crmIncidentSubject, crmThreads, crmCustomFields, crmStatusWithType);

        // If a category ID is provided, use it; otherwise, use the name to look up the record in CRM.
        if (crmCategoryIdField != null && !crmCategoryIdField.equals("null")) {
            CrmIdObject crmCategoryId = new CrmIdObject(Integer.parseInt(crmCategoryIdField));
            crmIncidentPostRequest.setCategory(crmCategoryId);
        } else {
            CrmLookupNameObject crmCategory = new CrmLookupNameObject(crmCategoryLookupName);
            crmIncidentPostRequest.setCategory(crmCategory);
        }

        // Do not update product and assignTo at the time of update CRM
        if (!isUpdate) {
            crmIncidentPostRequest.setProduct(crmProduct);
            crmIncidentPostRequest.setAssignedTo(crmAssignedTo);
        }
        
        ArrayList<CrmFileAttachment> formPdfAttachments = this.formPDFAttachInCRM(execution);
        ArrayList<CrmFileAttachment> crmFileAttachments = this.crmAttachFiles(execution);
        if (crmFileAttachments != null) {
            if (formPdfAttachments != null) {
                crmFileAttachments.addAll(formPdfAttachments);
            }
            crmIncidentPostRequest.setFileAttachments(crmFileAttachments);
        } else {
            System.out.println("No file attachment found for CRM in form");
            if (formPdfAttachments != null) {
                crmIncidentPostRequest.setFileAttachments(formPdfAttachments);
            }
        }
        
        String url = getEndpointUrl(INCIDENTS);
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            ResponseEntity<String> response = null;
            if (isUpdate) {
                String crmId = String.valueOf(execution.getVariables().get(CRM_ID));
                url = getEndpointUrl(INCIDENTS +"/"+ crmId);
                System.out.println("Update CRM incident with ID :" + crmId);

                String filteredRequest = objectMapper.writeValueAsString(crmIncidentPostRequest);
                filteredRequest = removeNullValues(filteredRequest);

                response = httpServiceInvoker.execute(
                    url, HttpMethod.POST, filteredRequest, isUpdate, "CRM");
                CrmIncidentPostResponse crmIncidentPostResponse = new CrmIncidentPostResponse(Integer.parseInt(crmId), String.valueOf(execution.getVariables().get("crmLookupName")));
                // Sending an email by calling /incidentReponse endpoint
                CrmIdObject crmIncident = new CrmIdObject(Integer.parseInt(crmId));
                CrmIncidentPatchRequest crmIncidentPatchRequest = new CrmIncidentPatchRequest(crmIncident, true);
                url = getEndpointUrl("incidentResponse");
                ResponseEntity<String> patchResponse = httpServiceInvoker.execute(
                    url, HttpMethod.POST, objectMapper.writeValueAsString(crmIncidentPatchRequest), isUpdate, "CRM");
                
                return crmIncidentPostResponse;
            } else {
                response = httpServiceInvoker.execute(
                    url, HttpMethod.POST, objectMapper.writeValueAsString(crmIncidentPostRequest));
                String responseBody = response.getBody();
                HttpStatus responseStatus = response.getStatusCode();
                ObjectMapper objectMapper2 = new ObjectMapper();
                JsonNode jsonNode = objectMapper2.readTree(response.getBody());
                Integer incidentId = jsonNode.path("id").asInt();
                String incidentLookupName = jsonNode.path("lookupName").asText();
                if (incidentId == 0 || incidentLookupName.isEmpty()) {
                    System.out.println("incidentId or incidentLookupName is not found. incidentId: " + incidentId + " incidentLookupName: " + incidentLookupName);
                    return null;
                }
                CrmIncidentPostResponse crmIncidentPostResponse = new CrmIncidentPostResponse(incidentId, incidentLookupName);
                return crmIncidentPostResponse;
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    private String removeNullValues(String jsonString) {
        try {
            // Convert JSON string to object
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonString);
            
            // Remove keys with null values
            if (jsonNode.has("category") && jsonNode.get("category").isNull()) {
                ((ObjectNode) jsonNode).remove("category");
            }
            if (jsonNode.has("product") && jsonNode.get("product").isNull()) {
                ((ObjectNode) jsonNode).remove("product");
            }
            if (jsonNode.has("assignedTo") && jsonNode.get("assignedTo").isNull()) {
                ((ObjectNode) jsonNode).remove("assignedTo");
            }
            
            // Convert JSON object back to string
            return objectMapper.writeValueAsString(jsonNode);
        } catch (Exception e) {
            e.printStackTrace();
            return jsonString;
        }
    }

    private Integer getContactIdByIdir(String contactIdir) {
        String idirQueryParam = "?q=login=" + "'"+ contactIdir + "'";
        String queryParam = CONTACTS + idirQueryParam;
        String url = getEndpointUrl(queryParam);
        ResponseEntity<String> response = this.httpServiceInvoker.execute(url, HttpMethod.GET, null);
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = null;
        try {
            jsonNode = objectMapper.readTree(response.getBody());
            // Navigate to the "items" array and get the first item
            JsonNode items = jsonNode.path("items");
            if (items.size() > 0) {
                JsonNode firstItem = items.get(0);
                Integer id = firstItem.get("id").asInt();
                return id;
            } else {
                System.out.println("Could not find contact by idir: " + contactIdir + " in CRM");
                return null;
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }
    
    private Integer getContactIdByEmployeeId(String employeeId) {
        String empIdQueryParam = "?q=customFields.c.employee_id=" + "'"+ employeeId + "'";
        String queryParam = CONTACTS + empIdQueryParam;
        String url = getEndpointUrl(queryParam);
        ResponseEntity<String> response = this.httpServiceInvoker.execute(url, HttpMethod.GET, null);
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = null;
        try {
            jsonNode = objectMapper.readTree(response.getBody());
            // Navigate to the "items" array and get the first item
            JsonNode items = jsonNode.path("items");
            if (items.size() > 0) {
                JsonNode firstItem = items.get(0);
                Integer id = firstItem.get("id").asInt();
                return id;
            } else {
                System.out.println("Could not find contact by employeeId: " + employeeId + " in CRM");
                return null;
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void generateAndAddPDFForForm(String formId, String submissionId, int crmIncidentId, String fileName) throws Exception {
        String pdfEncodedBase64 = generatePDFForForm(formId, submissionId, fileName);
        addCrmAttachment(crmIncidentId, pdfEncodedBase64, fileName);
        System.out.println("Finished generating and adding PDF for form");
    }

    private String generatePDFForForm(String formId, String submissionId, String fileName) throws Exception {
        DataSource pdf = this.attachmentService.generatePdf(formId, submissionId);
        try (InputStream is = pdf.getInputStream(); ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
            int nRead;
            byte[] data = new byte[1024];
            while ((nRead = is.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }

            byte[] bytes = buffer.toByteArray();
            String encoded = Base64.getEncoder().encodeToString(bytes);
            return encoded;
        }
    }

    private void addCrmAttachment(int crmIncidentId ,String pdfEncodedBase64, String pdfName) {
        String addCrmAttachmentEndpoint = INCIDENTS +"/" + crmIncidentId + "/fileAttachments";
        String url = getEndpointUrl(addCrmAttachmentEndpoint);
        CrmFileAttachmentPostRequest crmFileAttachmentPostRequest = new CrmFileAttachmentPostRequest(pdfName, pdfEncodedBase64);
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            ResponseEntity<String> response = httpServiceInvoker.execute(
                url, HttpMethod.POST, objectMapper.writeValueAsString(crmFileAttachmentPostRequest));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    private void addCrmContactReference(Integer employeeContactId, Integer crmIncidentId) throws Exception {  
        System.out.println("Adding CRM contact reference started");
        String url = getEndpointUrl(REFERENCE_CONTACT);
        CrmIdObject crmIncidentIdObject = new CrmIdObject(crmIncidentId);
        CrmIdObject crmContactIdObject = new CrmIdObject(employeeContactId);
        CrmReferenceContactPostRequest crmReferenceContactPostRequest = new CrmReferenceContactPostRequest(crmContactIdObject, crmIncidentIdObject);
        ObjectMapper objectMapper = new ObjectMapper();
        ResponseEntity<String> response = httpServiceInvoker.execute(
            url, HttpMethod.POST, objectMapper.writeValueAsString(crmReferenceContactPostRequest));
    }

    private String getCurrentUserIdir(DelegateExecution execution) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String idir = jwt.getClaimAsString("idir").toLowerCase();
            if (idir.endsWith(IDIR_POSTFIX)) {
                idir = idir.substring(0, idir.length() - IDIR_POSTFIX.length());
            }
            return idir;
        }
        else {
            System.err.println("No authentication found!");
            return null;
        }
    }

    private String getEndpointUrl(String endpoint) {
        return crmUrl + "/" + endpoint;
    }

    private static HashMap<String, String> extractIds(String url) {
        // The regex pattern to match the formId and submissionId
        String pattern = ".*/form/(.*?)/submission/(.*)";
        
        // Create a Pattern object
        Pattern r = Pattern.compile(pattern);
        
        // Create matcher object
        Matcher m = r.matcher(url);
        HashMap<String, String> ids = new HashMap<>();

        if (m.find()) {
            ids.put("formId", m.group(1));
            ids.put("submissionId", m.group(2));
        }
        return ids;
    }

    private ArrayList<CrmFileAttachment> formPDFAttachInCRM(DelegateExecution execution) {
        // Generate a PDF of the form submission
        ArrayList<CrmFileAttachment> crmFileAttachments = new ArrayList<CrmFileAttachment>();
        try {
            String formUrl = String.valueOf(execution.getVariables().get(FORM_URL));
            Map<String, String> ids = extractIds(formUrl);
            String formId = ids.get(FORM_ID);
            String submissionId = ids.get(SUBMISSION_ID);

            String fileName = String.valueOf(execution.getVariables().get(CRM_MAT_PAT_ATTACHMENT_FILE_NAME_FIELD));
            if (fileName == null || fileName.equals("null")) {
                fileName = String.valueOf(execution.getVariables().get(CRM_FORM_PDF_ATTACHMENT_NAME));
            }
            String pdfEncodedBase64 = generatePDFForForm(formId, submissionId, fileName);
            CrmFileAttachment attachment = new CrmFileAttachment(pdfEncodedBase64);
            attachment.setFileName(fileName);
            attachment.setName(fileName.substring(0, Math.min(fileName.length(), 39)));
            attachment.setContentType("application/pdf");
            crmFileAttachments.add(attachment);
            return crmFileAttachments;
        } catch (Exception e) {
            System.out.println("generatePDFForForm failed. Exception: " + e);
            e.printStackTrace();
            return null;
        }
    }

    private ArrayList<CrmFileAttachment> crmAttachFiles(DelegateExecution execution) {
        String crmFileFields = String.valueOf(execution.getVariables().get(CRM_FILE_FIELDS_FROM_FORM));

        if (crmFileFields != null && !crmFileFields.equals("null")) {
            String formUrl = String.valueOf(execution.getVariables().get(FORM_URL));
            String fields[] = crmFileFields.trim().split(",");

            if (fields.length > 0) {
                String submission = formSubmissionService.readSubmission(formUrl);
                if(submission.isEmpty()) {
                    return null;
                } else {
                    return extractFileFromSubmission(submission, fields);
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private static ArrayList<CrmFileAttachment> extractFileFromSubmission(String submission, String fields[]) {
        ArrayList<CrmFileAttachment> crmFileAttachments = new ArrayList<CrmFileAttachment>();
        try {
            ObjectMapper objectMapper3 = new ObjectMapper();
            JsonNode jsonNode = objectMapper3.readTree(submission);

            for(String f : fields) {
                String fileAlias[] = f.split(":");
                JsonNode item = jsonNode.path("data").path(fileAlias[0]);
                if (item.size() > 0) {
                    for (JsonNode currentItem : item) {
                        String data = removeBase64TextFromData(currentItem.get("url").asText());
                        CrmFileAttachment attachment = new CrmFileAttachment(data);
                        String fileName = currentItem.get("name").asText();
                        attachment.setFileName(fileName);
                        // Max limit for name field is 40
                        if (fileAlias.length > 2) {
                            String tmpFileName = fileAlias[2] + "" + fileName;
                            attachment.setName(tmpFileName.substring(0, Math.min(tmpFileName.length(), 39)));
                            attachment.setFileName(tmpFileName);
                        } else if (fileAlias.length == 2) {
                            attachment.setName(fileAlias[1].substring(0, Math.min(fileAlias[1].length(), 39)));
                        } else {
                            attachment.setName(fileName.substring(0, Math.min(fileName.length(), 39)));
                        }
                        attachment.setContentType(currentItem.get("type").asText());
                        crmFileAttachments.add(attachment);
                    }
                }
            }

            if (crmFileAttachments.size() > 0) {
                return crmFileAttachments;
            } else {
                return null;
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    private static String removeBase64TextFromData(String base64) {
        return base64.replaceAll("data:.*?;base64,","");
    }
}
