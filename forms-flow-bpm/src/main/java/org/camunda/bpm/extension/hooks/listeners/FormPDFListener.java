package org.camunda.bpm.extension.hooks.listeners;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.Margin;
import com.microsoft.playwright.options.Media;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateExceptionHandler;
import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
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
import javax.mail.*;
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
    private String managerEmail;
    private String submitterEmail;

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
            JSONObject formValues = formSubmissionService.retrieveFormJson(formUrlString).getJSONObject("data");

            // Get the URL for the form fields
            formUrl = formUrlString.split("/submission/")[0];
            JSONObject formFields = formSubmissionService.retrieveFormJson(formUrl);

            // Extract the emails for the manager and submitter
            Map<String, Object> valuesDataMap = formSubmissionService.retrieveFormValues(formUrlString);
            managerEmail = String.valueOf(valuesDataMap.get("managerEmail"));
            submitterEmail = String.valueOf(valuesDataMap.get("email"));

            // Create the data to be passed to the template
            Map<String, Object> data = new HashMap<>();
            data.put("formFields", formFields );
            data.put("formValues", formValues);

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
            Message message = createMessage(mailService.getSession());

            // Send the message
            SendMailInvocation invocation = new SendMailInvocation(message, request, requestInterceptors, mailService);
            invocation.proceed();
        } catch (Exception e) {
            e.printStackTrace();
        }


    }

    public Message createMessage(Session session) throws Exception {

        MailConfiguration configuration = getConfiguration();
        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(configuration.getSender(), configuration.getSenderAlias()));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(submitterEmail + "," + managerEmail));

        message.setSubject("PDF Record of Form");

        // Create a multipart message
        Multipart multipart = new MimeMultipart();

        // Create the body text of the email
        BodyPart messageBodyPart = new MimeBodyPart();
        messageBodyPart.setText("This is a pdf copy of the form submitted by " + submitterEmail + " for your records");
        multipart.addBodyPart(messageBodyPart);

        // Create the pdf attachment
        messageBodyPart = new MimeBodyPart();
        String filename = "form.pdf";
        DataSource source = new FileDataSource(filename);
        messageBodyPart.setDataHandler(new DataHandler(source));
        messageBodyPart.setFileName(filename);
        multipart.addBodyPart(messageBodyPart);

        // Set the date and attach the parts to the message
        message.setSentDate(new Date());
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

            Browser browser = playwright.chromium().launch();
            Page page = browser.newPage();

            File f = new File("output.html");
            page.navigate(f.toPath().toUri().toURL().toString());
            Thread.sleep(500);

            page.emulateMedia(new Page.EmulateMediaOptions().setMedia(Media.SCREEN));
            page.pdf(new Page.PdfOptions().setPath(Paths.get("form.pdf")).setMargin(new Margin().setRight("40px").setLeft("40px").setTop("40px").setBottom("40px")));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    protected MailConfiguration getConfiguration() {
        if (configuration == null) {
            configuration = MailConfigurationFactory.getConfiguration();
        }
        return configuration;
    }

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
