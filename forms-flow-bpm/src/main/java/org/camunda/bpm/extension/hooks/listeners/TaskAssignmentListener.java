package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Page.WaitForSelectorOptions;
import com.microsoft.playwright.options.Margin;
import com.microsoft.playwright.options.WaitForSelectorState;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateExceptionHandler;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

import static java.lang.Thread.currentThread;

@Named("TaskAssignmentListener")
public class TaskAssignmentListener extends BaseListener implements TaskListener, IMessageEvent {

    protected MailConfiguration configuration;
    private Expression recipientEmails;
    private Expression body;
    private Expression subject;
    private Expression attachSubmission;
    private Expression attachments;

    @Value("${formsflow.ai.app.url}")
    private String baseUrl;

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Autowired
    private AsyncTaskExecutor playwrightExecutor;
    
    @Autowired
    private EmailAttachmentService attachmentService;

    public void notify(DelegateTask delegateTask) {

        MailService mailService = MailServiceFactory.getService(getConfiguration());

        try {
            // Get the string value of the variables passed from the task
            String emailBody = getBody(delegateTask.getExecution());
            String emailSubject = getSubject(delegateTask.getExecution());
            String taskId = String.valueOf(delegateTask.getId());
            String[] attachmentNames = getAttachmentNames(delegateTask.getExecution());
            List<Attachment> attachments = new ArrayList<>();
            Boolean attachPdf = getAttachSubmission(delegateTask.getExecution());

            InternetAddress[] recipients = getRecipients(delegateTask.getExecution());

            // Create empty request and interceptors for the SendMailInvocation
            SendMailRequest request = getRequest();
            List<ConnectorRequestInterceptor> requestInterceptors = getInterceptors();


            Map<String, JSONObject> submission = null;

            if(attachPdf || attachmentNames.length > 0) {
                submission = getFormPdfData(delegateTask.getExecution());
            }

            if(attachPdf) {
                attachments.add(generatePDFForForm(delegateTask.getExecution(), submission));
            }

            System.out.println("attachments: ");
            Arrays.stream(attachmentNames).forEach(System.out::println);

            if(attachmentNames.length > 0) {
                Map<String, JSONObject> finalSubmission = submission;
                Arrays.stream(attachmentNames)
                        .map(n -> {
                            try {
                                return fetchAttachmentForField(submissionId(delegateTask.getExecution()), n, finalSubmission.get("formValues"));
                            } catch (MalformedURLException | JsonProcessingException e) {
                                throw new RuntimeException(e);
                            }
                        })
                        .flatMap(Collection::stream)
                        .forEach(attachments::add);
            }

            if (recipients.length > 0) {
                try {
                    Message message = createMessage(recipients, emailBody, emailSubject, taskId, attachments, mailService.getSession());
                    SendMailInvocation invocation = new SendMailInvocation(message, request, requestInterceptors, mailService);

                    invocation.proceed();

                } catch (Exception e) {
                    throw new MailConnectorException("Failed to send mail: " + e.getMessage(), e);
                }
            }
        } catch (Exception e) {
            handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
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
                .map(n -> {
                    if(n instanceof JSONObject) {
                        return (JSONObject)n;
                    } else {
                        return null;
                    }
                })
                .filter(n -> {
                    if(n == null) {
                        return false;
                    }

                    // Validate that the given value looks like a file.
                    return n.get("originalName") != null
                            && n.get("type") != null
                            && n.get("url") != null;
                })
                .map(n -> {
                    try {

                        JSONObject fileDetails = (JSONObject) n.get("data");
                        String formUrl = n.getString("url");
                        fileDetails.put("submission", submissionId);

                        // Retrieve attachment from file service
                        DataSource source = this.attachmentService.getAttachment(formUrl, n);
                        return new Attachment(n.getString("originalName"), n.getString("type"), source);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                })
                .collect(Collectors.toList());
    }

    private Attachment generatePDFForForm(DelegateExecution execution, Map<String, JSONObject> data) throws Exception {
        // Generate the template from '/templates/form.html'
        Template template = getTemplate();

        // Create a temporary 'output.html' file template
        File f = null;
        try {
            f = File.createTempFile("output", ".html");
            template.process(data, new FileWriter(f));

            // Render the file as 'form.pdf'
            byte[] fileContent = RenderPage(f).get();

            return new Attachment("form.pdf", "application/pdf", fileContent);
        } finally {
            if (f != null) {
                f.deleteOnExit();
            }
        }
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

    public Message createMessage(InternetAddress[] recipients, String body, String subject, String taskId, List<Attachment> attachments, Session session) throws Exception {
        MailConfiguration configuration = getConfiguration();
        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(configuration.getSender(), configuration.getSenderAlias()));
        Address[] addresses;
        message.setRecipients(RecipientType.TO, recipients);

        // Create a multipart message
        Multipart multipart = new MimeMultipart();

        // Create the body text of the email
        String bodyUrl = body.replace("$BASE_URL", baseUrl);
        String finalBody = bodyUrl.replace("$TASK_ID", taskId);
        BodyPart messageBodyPart = new MimeBodyPart();
        if (!body.isEmpty()) {
            messageBodyPart.setText(finalBody);
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

    private Future<byte[]> RenderPage(File file) throws Exception {
        Future<byte[]> f = playwrightExecutor.submit(() -> {
            Thread t = currentThread();
            Browser b = ((PlaywrightThread) t).getBrowser();
            try(BrowserContext c = b.newContext()) {
                Page page = c.newPage();

                try {
                    page.navigate(file.toPath().toUri().toURL().toString());
                } catch (MalformedURLException e) {
                    throw new RuntimeException(e);
                }
                page.waitForSelector("#formio-form-rendered", new WaitForSelectorOptions().setState(WaitForSelectorState.ATTACHED));
                return page.pdf(new Page.PdfOptions().setMargin(new Margin().setRight("40px").setLeft("40px").setTop("40px").setBottom("40px")));
            }
        });

        return f;
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
        return String.valueOf(this.subject.getValue(delegateExecution));
    }

    private InternetAddress[] getRecipients(DelegateExecution delegateExecution) throws AddressException {
        String[] recipientArray = String.valueOf(this.recipientEmails.getValue(delegateExecution)).split(",");
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
        return String.valueOf(this.body.getValue(delegateExecution));
    }

    private Boolean getAttachSubmission(DelegateExecution delegateExecution) {
        return Boolean.parseBoolean((String) this.attachSubmission.getValue(delegateExecution));
    }

    private String[] getAttachmentNames(DelegateExecution delegateExecution) {
        if(this.attachments == null) {
            return new String[0];
        }
        Object attachmentValues = this.attachments.getValue(delegateExecution);
        if(attachmentValues == null) {
            return new String[0];
        }

        return ((String)attachmentValues).split(",");
    }
}
