package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.*;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.model.Attachment;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import com.fasterxml.jackson.databind.ObjectMapper;

import main.java.org.camunda.bpm.extension.hooks.model.CrmFileAttachmentPostRequest;
import main.java.org.camunda.bpm.extension.hooks.model.CrmPostRequest;
import main.java.org.camunda.bpm.extension.hooks.model.CrmPostResponse;
import main.java.org.camunda.bpm.extension.hooks.model.CrmEntryType;
import main.java.org.camunda.bpm.extension.hooks.model.CrmChannel;
import main.java.org.camunda.bpm.extension.hooks.model.CrmContentType;
import main.java.org.camunda.bpm.extension.hooks.model.CrmPrimaryContact;
import main.java.org.camunda.bpm.extension.hooks.model.CrmThread;
import main.java.org.camunda.bpm.extension.hooks.model.CrmProduct;
import main.java.org.camunda.bpm.extension.hooks.model.CrmCategory;
import main.java.org.camunda.bpm.extension.hooks.model.CrmStaffGroup;
import main.java.org.camunda.bpm.extension.hooks.model.CrmAssignedTo;

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
    private static final String ATTACHMENT_FILE_NAME = "attachment.pdf";
    private static final String IDIR_POSTFIX = "@idir";
    private static final String CRM_ID = "crmId";
    private static final String CRM_LOOKUP_NAME = "crmLookupName";
    private static final String CRM_MAT_PAT_PRODUCT_LOOKUP_NAME_FIELD = "crmProductLookupName";
    private static final String CRM_MAT_PAT_CATEGORY_LOOKUP_NAME_FIELD = "crmCategoryLookupName";
    private static final String CRM_MAT_PAT_STAFF_GROUP_LOOKUP_NAME_FIELD = "crmStaffGroupLookupName";
    private static final String CRM_MAT_PAT_SUBJECT_FIELD = "crmSubject";
    private static final String CRM_MAT_PAT_SUBMITTER_NAME_FIELD = "submissionDisplayName";
    private static final String CRM_THREAD_TEXT_FIELD = "crmThreadText";

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Value("${formsflow.ai.crm.url}")
    private String crmUrl;

    @Autowired
    private EmailAttachmentService attachmentService;

    @Override
    public void execute(DelegateExecution execution) {
        this.crmOperation(execution);
    }

    private void crmOperation(DelegateExecution execution) {
        System.out.println("Starting CRM operation");        
        
        // If the crmId is already present, then skip the CRM operation 
        // @TODO: This needs to be improved once UPDATE CRM is implemented
        String crmId = String.valueOf(execution.getVariables().get(CRM_ID));
        if (execution.getVariables().get(CRM_ID) != null && !crmId.isEmpty() && !crmId.equals("null")) {
            return;
        }

        // Get the formId and submissionId from the formUrl
        String formUrl = String.valueOf(execution.getVariables().get(FORM_URL));
        Map<String, String> ids = extractIds(formUrl);
        String formId = ids.get(FORM_ID);
        String submissionId = ids.get(SUBMISSION_ID);
        
        if (formId == null || submissionId == null) {
            System.out.println("formId or submissionId is null. formUrl: " + formUrl + " formId: " + formId + " submissionId" + submissionId);
            throw new ApplicationServiceException("formId or submissionId is null");
        }

        // Find current user's idir
        String currentUserIdir = null;
        try {
            currentUserIdir = getCurrentUserIdir(execution);
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("No idir user found! Exception: " + e);
        }
        if (currentUserIdir == null) {
            System.out.println("currentUserIdir is null: " + currentUserIdir);
            throw new ApplicationServiceException("currentUserIdir is null");
        }
        
        // Find the manager's contact details in CRM
        Integer contactId = getContactId(currentUserIdir);
        if (contactId == null) {
            System.out.println("contactId is null: " + contactId);
            throw new ApplicationServiceException("contactId is null");
        }

        // Create a new incident in CRM
        CrmPostResponse crmPostResponse = createCrmIncident(contactId, execution);
        if (crmPostResponse == null) {
            System.out.println("crmPostResponse is null: " + crmPostResponse);
            throw new ApplicationServiceException("createCrmIncident failed.");
        }
        // Saving the CRM incident id and lookupName in form
        execution.setVariable(CRM_ID, crmPostResponse.getId());
        execution.setVariable(CRM_LOOKUP_NAME, crmPostResponse.getLookupName());

        // Generate a PDF of the form submission
        try {
            String pdfName = "test.pdf"; //Todo - change to a more meaningful name
            generateAndAddPDFForForm(formId, submissionId, crmPostResponse.getId());
        } catch (Exception e) {
            System.out.println("generatePDFForForm failed. Exception: " + e);
            e.printStackTrace();
        }
        
        System.out.println("Finished CRM operation");
    }

    private CrmPostResponse createCrmIncident(int contactId, DelegateExecution execution) {
        // Loading the CRM fields from the form
        String crmProductLookupName = String.valueOf(execution.getVariables().get(CRM_MAT_PAT_PRODUCT_LOOKUP_NAME_FIELD));
        String crmCategoryLookupName = String.valueOf(execution.getVariables().get(CRM_MAT_PAT_CATEGORY_LOOKUP_NAME_FIELD));
        String crmStaffGroupLookupName = String.valueOf(execution.getVariables().get(CRM_MAT_PAT_STAFF_GROUP_LOOKUP_NAME_FIELD));
        String crmSubject = String.valueOf(execution.getVariables().get(CRM_MAT_PAT_SUBJECT_FIELD));
        String submitterDisplayName = String.valueOf(execution.getVariables().get(CRM_MAT_PAT_SUBMITTER_NAME_FIELD));
        String threadText = String.valueOf(execution.getVariables().get(CRM_THREAD_TEXT_FIELD));
        
        String crmIncidentSubject = crmSubject + " for " + submitterDisplayName;
        CrmPrimaryContact crmPrimaryContact = new CrmPrimaryContact(contactId);
        if (threadText == null) {
            threadText = "";
        }
        CrmEntryType crmEntryType = new CrmEntryType(4); // lookupName": "Customer Proxy"
        CrmChannel crmChannel = new CrmChannel(6); // "lookupName": "CSS Web"
        CrmContentType crmContentType = new CrmContentType(2); // "lookupName": "text/html", 1 for "text/plain"
        CrmThread crmThread1 = new CrmThread(threadText, crmEntryType, crmChannel, crmContentType);
        ArrayList<CrmThread> crmThreads = new ArrayList<CrmThread>();
        crmThreads.add(crmThread1);
        CrmProduct crmProduct = new CrmProduct(crmProductLookupName);
        CrmCategory crmCategory = new CrmCategory(crmCategoryLookupName);
        CrmStaffGroup crmStaffGroup = new CrmStaffGroup(crmStaffGroupLookupName);
        CrmAssignedTo crmAssignedTo = new CrmAssignedTo(crmStaffGroup);
        CrmPostRequest crmPostRequest = new CrmPostRequest(crmPrimaryContact, crmIncidentSubject, crmThreads, crmProduct, crmCategory, crmAssignedTo);
        String url = getEndpointUrl(INCIDENTS);
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            ResponseEntity<String> response = httpServiceInvoker.execute(
                url, HttpMethod.POST, objectMapper.writeValueAsString(crmPostRequest));
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
            CrmPostResponse crmPostResponse = new CrmPostResponse(incidentId, incidentLookupName);
            return crmPostResponse;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    private Integer getContactId(String contactIdir) {
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
                System.out.println("Could not find contact with idir: " + contactIdir + " in CRM");
                return null;
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void generateAndAddPDFForForm(String formId, String submissionId, int crmIncidentId) throws Exception {
        String pdfEncodedBase64 = generatePDFForForm(formId, submissionId, ATTACHMENT_FILE_NAME);
        addCrmAttachment(crmIncidentId, pdfEncodedBase64, ATTACHMENT_FILE_NAME);
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
}
