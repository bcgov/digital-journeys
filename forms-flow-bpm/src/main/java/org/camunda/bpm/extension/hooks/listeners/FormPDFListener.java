package org.camunda.bpm.extension.hooks.listeners;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateExceptionHandler;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.camunda.bpm.extension.hooks.services.IMessageEvent;
import org.camunda.bpm.extension.mail.EmptyResponse;
import org.camunda.bpm.extension.mail.config.MailConfiguration;
import org.camunda.bpm.extension.mail.config.MailConfigurationFactory;
import org.camunda.bpm.extension.mail.send.SendMailInvocation;
import org.camunda.bpm.extension.mail.send.SendMailRequest;
import org.camunda.bpm.extension.mail.service.MailService;
import org.camunda.bpm.extension.mail.service.MailServiceFactory;
import org.camunda.connect.impl.AbstractConnector;
import org.camunda.connect.spi.ConnectorRequestInterceptor;
import org.camunda.connect.spi.ConnectorResponse;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.inject.Named;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.ws.rs.core.Application;
import java.io.*;
import java.nio.file.Paths;
import java.util.*;

@Named("FormPDFListener")
public class FormPDFListener extends BaseListener implements TaskListener, IMessageEvent {

    protected MailConfiguration configuration;

    private String formUrl;

    private TaskAssignmentListener taskAssignmentListener;

    @Autowired
    private FormSubmissionService formSubmissionService;

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Override
    public void notify(DelegateTask delegateTask) {
        try {

            // Get Form Values
            DelegateExecution execution = delegateTask.getExecution();
            String formUrlString = String.valueOf(execution.getVariables().get("formUrl"));
            String[] urlParts = formUrlString.split("/submission/");
            formUrl = urlParts[0];
            JSONObject formValues = formSubmissionService.retrieveFormJson(formUrlString);
            JSONObject formValuesData = formValues.getJSONObject("data");
            JSONObject formFields = formSubmissionService.retrieveFormJson(formUrl);

            // TODO: implement recipient
            Map<String, Object> valuesDataMap = formSubmissionService.retrieveFormValues(formUrlString);
            Object recipient = valuesDataMap.get("managerEmail");

            // Create the data to be passed to the template
            Map<String, Object> data = new HashMap<>();
            data.put("formFields", formFields );
            data.put("formValues", formValuesData);

            // TODO: remove this println
            System.out.println(recipient.toString());

            System.out.println("------------Fields----------------");
            System.out.println(formFields);
            System.out.println("------------Fields----------------");

            System.out.println("------------Values----------------");
            System.out.println(formValuesData);
            System.out.println("------------Values----------------");

            // Generate the template from '/templates/form.html'
            Template template = getTemplate();

            // Save the template as output.html
            Writer fileWriter = new FileWriter(new File("output.html"));
            template.process(data, fileWriter);


            // Render 'output.html' and save as 'form.pdf'
            RenderPage();

            // Instantiate the mail service
            MailService mailService = MailServiceFactory.getService(getConfiguration());
            SendMailRequest request = getRequest();
            List<ConnectorRequestInterceptor> requestInterceptors = getInterceptors();

            // Create the message to be sent
            Message message = createMessage("mat@freshworks.io", "emailBody", "emailSubject", "taskId", mailService.getSession());

            // Send the message
            SendMailInvocation invocation = new SendMailInvocation(message, request, requestInterceptors, mailService);
            invocation.proceed();
        } catch (Exception e) {
            e.printStackTrace();
        }


    }

    public String getFormJSON() {
        ResponseEntity<String> response =  httpServiceInvoker.execute(formUrl, HttpMethod.GET, null);
        if(response.getStatusCode().value() == HttpStatus.OK.value()) {
            return response.getBody();
        } else {
            throw new FormioServiceException("Unable to read submission for: "+ formUrl+ ". Message Body: " +
                    response.getBody());
        }
    }

    public Message createMessage(String recipient, String body, String subject, String taskId, Session session) throws Exception {
        MailConfiguration configuration = getConfiguration();
        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(configuration.getSender(), configuration.getSenderAlias()));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipient));

        // Create the message part
        BodyPart messageBodyPart = new MimeBodyPart();

        // Now set the actual message
        messageBodyPart.setText("This is message body");

        // Create a multipart message
        Multipart multipart = new MimeMultipart();

        // Set text message part
        multipart.addBodyPart(messageBodyPart);

        messageBodyPart = new MimeBodyPart();
        String filename = "form.pdf";
        DataSource source = new FileDataSource(filename);
        messageBodyPart.setDataHandler(new DataHandler(source));
        messageBodyPart.setFileName(filename);
        multipart.addBodyPart(messageBodyPart);

        message.setSentDate(new Date());
        message.setSubject(subject);
        message.setContent(multipart);

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

    private void RenderPage() throws IOException {
        try (Playwright playwright = Playwright.create()) {
            StringBuilder html = new StringBuilder();
            FileReader fr = new FileReader("output.html");
            BufferedReader bufferedReader = new BufferedReader(fr);
            String val;
            while ((val = bufferedReader.readLine()) != null) {
                html.append(val);
            }
            bufferedReader.close();
            String result = html.toString();

            Browser browser = playwright.chromium().launch();
            Page page = browser.newPage();

            File f = new File("output.html");
            page.navigate(f.toPath().toUri().toURL().toString());

            page.pdf(new Page.PdfOptions().setPath(Paths.get("form.pdf")));
            page.onConsoleMessage(msg -> System.out.println(msg.text()));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

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

}
