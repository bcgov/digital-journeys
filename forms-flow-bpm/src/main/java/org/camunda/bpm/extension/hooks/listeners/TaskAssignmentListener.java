package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.core.JsonProcessingException;

import camundajar.impl.scala.collection.ClassTagIterableFactory.Delegate;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateExceptionHandler;
import org.camunda.bpm.engine.delegate.*;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.model.Attachment;
import org.camunda.bpm.extension.hooks.services.EmailAttachmentService;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.camunda.bpm.extension.hooks.services.IMessageEvent;
import org.camunda.bpm.extension.mail.EmptyResponse;
import org.camunda.bpm.extension.mail.MailConnectorException;
import org.camunda.bpm.extension.mail.config.MailConfiguration;
import org.camunda.bpm.extension.mail.config.MailConfigurationFactory;
import org.camunda.bpm.extension.mail.send.SendMailInvocation;
import org.camunda.bpm.extension.mail.send.SendMailRequest;
import org.camunda.bpm.extension.mail.service.MailService;
import org.camunda.bpm.extension.mail.service.MailServiceFactory;
import org.camunda.connect.impl.AbstractConnector;
import org.camunda.connect.spi.ConnectorRequestInterceptor;
import org.camunda.connect.spi.ConnectorResponse;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Scope;
import org.springframework.core.task.AsyncTaskExecutor;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.inject.Named;
import javax.mail.*;
import javax.mail.Message.RecipientType;
import javax.mail.internet.*;
import javax.mail.util.ByteArrayDataSource;
import javax.ws.rs.core.Application;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.*;
import java.util.concurrent.Future;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import static java.lang.Thread.currentThread;

import java.lang.System.*;

@Named("TaskAssignmentListener")
@Scope(value = "prototype")
public class TaskAssignmentListener extends BaseListener implements TaskListener, ExecutionListener, JavaDelegate, IMessageEvent {

    private final Logger logger = LoggerFactory.getLogger(TaskAssignmentListener.class.getName());

    public static final String[] INVALID_CHARS = {"\\", "/", ":", "*", "?", "\"", "<", ">", "|", "[", "]", "\"", ";","=", "," };

    protected MailConfiguration configuration;
    private Expression recipientEmails;
    private Expression body;
    private Expression subject;
    private Expression attachSubmission;
    private Expression attachSubmissionName;
    private Expression attachments;

    @Value("${formsflow.ai.app.url}")
    private String baseUrl;

    @Autowired
    private FormSubmissionService formSubmissionService;
    
    @Autowired
    private EmailAttachmentService attachmentService;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        notify(execution);
    }

    @Override
    public void notify(DelegateExecution execution) throws Exception {
        try {
            sendEmail(execution, null);
        } catch (Exception e) {
            logger.error("Failed task", e);
            handleException(execution, ExceptionSource.EXECUTION, e);
        }

    }

    @Override
    public void notify(DelegateTask delegateTask) {
        try {
            sendEmail(delegateTask.getExecution(), String.valueOf(delegateTask.getId()));
        } catch (Exception e) {

            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
        }

    }

    private void sendEmail(DelegateExecution execution, String taskId) throws Exception {
        MailService mailService = MailServiceFactory.getService(getConfiguration());
        // Get the string value of the variables passed from the task
        String emailBody = getBody(execution);
        String emailSubject = getSubject(execution);
        String[] attachmentNames = getAttachmentNames(execution);
        List<Attachment> attachments = new ArrayList<>();
        Boolean attachPdf = getAttachSubmission(execution);

        InternetAddress[] recipients = getRecipients(execution);

        String emailSender = getSenderValue(execution);
        String emailSenderAlias = getSenderAliasValue(execution);

        // Create empty request and interceptors for the SendMailInvocation
        SendMailRequest request = getRequest();
        List<ConnectorRequestInterceptor> requestInterceptors = getInterceptors();


        Map<String, JSONObject> submission = null;

        if(attachPdf || attachmentNames.length > 0) {
            submission = getFormPdfData(execution);
        }

        if(attachPdf) {
            attachments.add(generatePDFForForm(formId(execution), submissionId(execution), getAttachSubmissionName(execution)));
        }

        if(attachmentNames.length > 0) {
            Map<String, JSONObject> finalSubmission = submission;
            Arrays.stream(attachmentNames)
                    .map(n -> {
                        try {
                            return fetchAttachmentForField(submissionId(execution), n, finalSubmission.get("formValues"));
                        } catch (MalformedURLException | JsonProcessingException e) {
                            throw new RuntimeException(e);
                        }
                    })
                    .flatMap(Collection::stream)
                    .forEach(attachments::add);
        }

        if (recipients.length > 0) {

            // DGJ-2108 Send individual email to each recipient in the list
            //for ( InternetAddress part : recipients ) {
                try {

                    Message message;
                    //InternetAddress[] singleRecipientList = new InternetAddress[] { part };
                    InternetAddress[] singleRecipientList = recipients;
                    //logger.error("Sending individual email to {}", part.toString());

                    if ( emailSender != null && emailSenderAlias != null && emailSender.indexOf("@") > 0 ) {
                        try {

                            InternetAddress sender = new InternetAddress(emailSender, emailSenderAlias);
                            message = createMessage(sender, singleRecipientList, emailBody, emailSubject, taskId, attachments, mailService.getSession());
                        } catch (Exception e) {
                            logger.error("Failed to create message with sender: {}, sender alias: {}", emailSender, emailSenderAlias, e);
                            message = createMessage(singleRecipientList, emailBody, emailSubject, taskId, attachments, mailService.getSession());
                        }

                    } else {
                        message = createMessage(singleRecipientList, emailBody, emailSubject, taskId, attachments, mailService.getSession());
                    }

                    SendMailInvocation invocation = new SendMailInvocation(message, request, requestInterceptors, mailService);

                    invocation.proceed();
                } catch (Exception e) {
                    throw new MailConnectorException("Failed to send mail: " + e.getMessage(), e);
                }
            //}
        }
    }

    /**
     * Retrieves the attachments associated with the given submission for form field `field`
     */
    private List<Attachment> fetchAttachmentForField(String submissionId, String field, JSONObject values) throws MalformedURLException, JsonProcessingException {
        if(!values.has(field)) {
            return new ArrayList<>();
        }

        Object val = values.get(field);

        if(val == null) {
            return new ArrayList<>();
        }

        JSONArray attachments;
        if (val instanceof JSONArray) {
            attachments = (JSONArray) val;
        } else if(val instanceof JSONObject){
            attachments = new JSONArray().put(val);
        } else {
            return new ArrayList<>();
        }

        return StreamSupport.stream(attachments.spliterator(), false)
                .map(fileData -> {
                    if(fileData instanceof JSONObject) {
                        return (JSONObject)fileData;
                    } else {
                        return null;
                    }
                })
                .filter(fileData -> {
                    if(fileData == null) {
                        return false;
                    }

                    // Validate that the given value looks like a file.
                    return fileData.get("originalName") != null
                            && fileData.get("type") != null
                            && fileData.get("url") != null;
                })
                .map(fileData -> {
                    try {
                        if (fileData.getString("storage").equals("base64")) {
                            String base64Data = removeBase64TextFromData(fileData.getString("url"));
                            String fileType = fileData.getString("type");
                            if (fileType == "") {
                                fileType = extractMimeType(fileData.getString("url"));
                            }

                            // Convert base64 data into byteArray.
                            byte[] pdfBytes = javax.xml.bind.DatatypeConverter.parseBase64Binary(base64Data);
                            DataSource dataSource = new ByteArrayDataSource(pdfBytes, fileType);
                            return new Attachment(fileData.getString("originalName"), fileType, dataSource);
                        } else {
                            JSONObject fileDetails = (JSONObject) fileData.get("data");
                            String formUrl = fileData.getString("url");
                            fileDetails.put("submission", submissionId);
    
                            // Retrieve attachment from file service
                            DataSource source = this.attachmentService.getAttachment(formUrl, fileData);
                            return new Attachment(fileData.getString("originalName"), fileData.getString("type"), source);
                        }
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                })
                .collect(Collectors.toList());
    }

    private Attachment generatePDFForForm(String formId, String submissionId, String fileName) throws Exception {
        DataSource pdf = this.attachmentService.generatePdf(formId, submissionId);

        return new Attachment(fileName, "application/pdf", pdf);
    }

    private Map<String, JSONObject> getFormPdfData(DelegateExecution execution) throws IOException {
        // Get Form Values
        String formUrlString = String.valueOf(execution.getVariables().get("formUrl"));
        JSONObject formValues = formSubmissionService.retrieveFormJson(formUrlString).getJSONObject("data");

        // Get the URL for the form fields
        String formUrl = formUrlString.split("/submission/")[0];
        JSONObject formFields = formSubmissionService.retrieveFormJson(formUrl);

        // Create the data to be passed to the template
        Map<String, JSONObject> data = new HashMap<>();
        data.put("formFields", formFields);
        data.put("formValues", formValues);
        return data;
    }

    private String submissionId(DelegateExecution execution) {
        String formUrlString = String.valueOf(execution.getVariables().get("formUrl"));
        return formUrlString.split("/submission/")[1];
    }

    private String formId(DelegateExecution execution) {
        String formUrlString = String.valueOf(execution.getVariables().get("formUrl"));
        return formUrlString.split("/submission/")[0].split("/form/")[1];
    }

    public Message createMessage(InternetAddress[] recipients, String body, String subject, String taskId, List<Attachment> attachments, Session session) throws Exception {
        
        MailConfiguration configuration = getConfiguration();
        
        String senderValue = configuration.getSender();
        String senderAliasValue = configuration.getSenderAlias();

        InternetAddress sender = new InternetAddress(senderValue, senderAliasValue);

        return createMessage(sender, recipients, body, subject, taskId, attachments, session);
    }

    public Message createMessage(InternetAddress sender, InternetAddress[] recipients, String body, String subject, String taskId, List<Attachment> attachments, Session session) throws Exception {

        Message message = new MimeMessage(session);

        //DGJ-2108 Send individual email to each recipient in the list using BCC
        
        String recipientEmailAddress = Optional.ofNullable(System.getenv("DJ_RECIPIENT_EMAILADDRESS"))
                            .orElse("digitaljourneys@gov.bc.ca");

        InternetAddress[] noreply = new InternetAddress[] { new InternetAddress(recipientEmailAddress) };

        message.setFrom(sender);
        Address[] addresses;
        message.setRecipients(RecipientType.BCC, recipients);
        message.setRecipients(RecipientType.TO, noreply);

        // Create a multipart message
        Multipart multipart = new MimeMultipart();

        // Create the body text of the email
        body = body.replace("$BASE_URL", baseUrl);

        if(taskId != null) {
            body = body.replace("$TASK_ID", taskId);
        }
        BodyPart messageBodyPart = new MimeBodyPart();
        if (!body.isEmpty()) {
            messageBodyPart.setContent(body, "text/html");
        } else {
            message.setText("");
        }
        multipart.addBodyPart(messageBodyPart);

        // Add any attachments to the email
        attachments.forEach(a -> {
            MimeBodyPart attPart = new MimeBodyPart();
            try {
                attPart.setDataHandler(new DataHandler(a.getDataSource()));
                attPart.setFileName(a.getFileName());
                multipart.addBodyPart(attPart);
            } catch (MessagingException e) {
                e.printStackTrace();
            }

        });

        message.setSentDate(new Date());
        message.setContent(multipart);
        message.setSubject(subject);

        return message;
    }

    private Template getTemplate() throws IOException {
        // Instantiate the FreekMarker config
        Configuration cfg = new Configuration(Configuration.VERSION_2_3_29);
        cfg.setClassForTemplateLoading(Application.class, "/templates");
        cfg.setDefaultEncoding("UTF-8");
        cfg.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);
        cfg.setLogTemplateExceptions(false);
        cfg.setWrapUncheckedExceptions(true);
        cfg.setFallbackOnNullLoopVariable(false);
        Template template = cfg.getTemplate("/form.html");
        return template;
    }

    /**
     * Generate a MailConfiguration using `src.main.resources.mail-config.properties`
     *
     * @return MailConfiguration
     */
    protected MailConfiguration getConfiguration() {
        if (configuration == null) {
            configuration = MailConfigurationFactory.getConfiguration();
        }
        return configuration;
    }

    /**
     * Generate empty interceptors
     *
     * @return ConnectorRequestInterceptor
     */
    public List<ConnectorRequestInterceptor> getInterceptors() {
        return new List<ConnectorRequestInterceptor>() {
            @Override
            public int size() {
                return 0;
            }

            @Override
            public boolean isEmpty() {
                return false;
            }

            @Override
            public boolean contains(Object o) {
                return false;
            }

            @Override
            public Iterator<ConnectorRequestInterceptor> iterator() {
                return null;
            }

            @Override
            public Object[] toArray() {
                return new Object[0];
            }

            @Override
            public <T> T[] toArray(T[] a) {
                return null;
            }

            @Override
            public boolean add(ConnectorRequestInterceptor connectorRequestInterceptor) {
                return false;
            }

            @Override
            public boolean remove(Object o) {
                return false;
            }

            @Override
            public boolean containsAll(Collection<?> c) {
                return false;
            }

            @Override
            public boolean addAll(Collection<? extends ConnectorRequestInterceptor> c) {
                return false;
            }

            @Override
            public boolean addAll(int index, Collection<? extends ConnectorRequestInterceptor> c) {
                return false;
            }

            @Override
            public boolean removeAll(Collection<?> c) {
                return false;
            }

            @Override
            public boolean retainAll(Collection<?> c) {
                return false;
            }

            @Override
            public void clear() {

            }

            @Override
            public ConnectorRequestInterceptor get(int index) {
                return null;
            }

            @Override
            public ConnectorRequestInterceptor set(int index, ConnectorRequestInterceptor element) {
                return null;
            }

            @Override
            public void add(int index, ConnectorRequestInterceptor element) {

            }

            @Override
            public ConnectorRequestInterceptor remove(int index) {
                return null;
            }

            @Override
            public int indexOf(Object o) {
                return 0;
            }

            @Override
            public int lastIndexOf(Object o) {
                return 0;
            }

            @Override
            public ListIterator<ConnectorRequestInterceptor> listIterator() {
                return null;
            }

            @Override
            public ListIterator<ConnectorRequestInterceptor> listIterator(int index) {
                return null;
            }

            @Override
            public List<ConnectorRequestInterceptor> subList(int fromIndex, int toIndex) {
                return null;
            }
        };

    }

    /**
     * Generate an empty request object
     *
     * @return SendMailRequest
     */
    public SendMailRequest getRequest() {
        return new SendMailRequest(new AbstractConnector<SendMailRequest, EmptyResponse>("mail-send") {
            @Override
            public SendMailRequest createRequest() {
                return null;
            }

            @Override
            public ConnectorResponse execute(SendMailRequest sendMailRequest) {
                return null;
            }
        }, getConfiguration());
    }

    private String getSubject(DelegateExecution delegateExecution) {
        Object subject = delegateExecution.getVariable("subject");

        if(subject == null) {
            return String.valueOf(this.subject.getValue(delegateExecution));
        }

        return String.valueOf(subject);
    }

    private String getSenderValue(DelegateExecution delegateExecution) {
        Object sender = delegateExecution.getVariable("sender");

        if ( sender == null ) {
            return null;
        }

        return String.valueOf(sender);
    }
    
    private String getSenderAliasValue(DelegateExecution delegateExecution) {
        Object alias = delegateExecution.getVariable("senderAlias");

        if ( alias == null ) {
            return null;
        }

        return String.valueOf(alias);
    }

    private String[] getRecipientsValue(DelegateExecution delegateExecution) {
        Object recipientEmails = delegateExecution.getVariable("recipientEmails");
        if(recipientEmails == null) {
            recipientEmails = this.recipientEmails.getValue(delegateExecution);
        }

        String[] recipientArray = String.valueOf(recipientEmails).split(",");

        return recipientArray;
    }

    private InternetAddress[] getRecipients(DelegateExecution delegateExecution) throws AddressException {
        String[] recipientArray = getRecipientsValue(delegateExecution);
        InternetAddress[] recipients = Arrays.stream(recipientArray)
                .map(r -> {
                    try {
                        return InternetAddress.parse(r)[0];
                    } catch (AddressException e) {
                        e.printStackTrace();
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .toArray(InternetAddress[]::new);
        return recipients;
    }

    private String getBody(DelegateExecution delegateExecution) {
        Object body = delegateExecution.getVariable("body");

        if(body == null) {
            return String.valueOf(this.body.getValue(delegateExecution));
        }

        return String.valueOf(body);
    }

    private String getAttachSubmissionNameValue(DelegateExecution execution) {

        Object attachSubmissionName = execution.getVariable("attachSubmissionName");

        if(attachSubmissionName != null) {
            return String.valueOf(attachSubmissionName);
        }

        if(this.attachSubmissionName == null || this.attachSubmissionName.getValue(execution) == null) {
            return null;
        }

        return (String) this.attachSubmissionName.getValue(execution);
    }

    private Boolean getAttachSubmission(DelegateExecution delegateExecution) {
        Object attachSubmission = delegateExecution.getVariable("attachSubmission");
        if(attachSubmission == null) {
            if(this.attachSubmission == null) { return false; }
            attachSubmission = this.attachSubmission.getValue(delegateExecution);
        }

        return Boolean.parseBoolean(String.valueOf(attachSubmission));
    }

    private String getAttachSubmissionName(DelegateExecution delegateExecution) {
        String attachSubmissionName = getAttachSubmissionNameValue(delegateExecution);
        if(attachSubmissionName == null) {
            return "form.pdf";
        }

        return sanitizeFileName(attachSubmissionName) + ".pdf";
    }

    private String[] getAttachmentNames(DelegateExecution delegateExecution) {
        Object attachments = delegateExecution.getVariable("attachments");

        if(attachments != null) {
            return ((String)attachments).split(",");
        } 

        if(this.attachments == null) {
            return new String[0];
        }
        Object attachmentValues = this.attachments.getValue(delegateExecution);
        if(attachmentValues == null) {
            return new String[0];
        }

        return ((String)attachmentValues).split(",");
    }

    public static TaskAssignmentListener getInstance() {
        return new TaskAssignmentListener();
    }

    private static String sanitizeFileName(String fn) {
        for(String c: INVALID_CHARS) {
            fn = fn.replace(c, "");
        }

        return fn;
    }

    private static String removeBase64TextFromData(String base64) {
        return base64.replaceAll("data:.*?;base64,","");
    }

    private static String extractMimeType(String dataUri) {
        // Check if the URI starts with "data:"
        if (dataUri.startsWith("data:")) {
            // Find the index of the first semicolon ';' after "data:"
            int semicolonIndex = dataUri.indexOf(';');
            // Extract substring between "data:" and the first semicolon ';' or end of string
            return semicolonIndex != -1 ? dataUri.substring(5, semicolonIndex) : dataUri.substring(5);
        }
        return "application/octet-stream";
    }
}
