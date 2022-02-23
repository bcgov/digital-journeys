package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.Expression;
import org.camunda.bpm.engine.delegate.TaskListener;
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
import org.springframework.beans.factory.annotation.Value;

import javax.inject.Named;
import javax.mail.Message;
import javax.mail.Message.RecipientType;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.*;

@Named("TaskAssignmentListener")
public class TaskAssignmentListener extends BaseListener implements TaskListener, IMessageEvent {

    protected MailConfiguration configuration;
    private Expression recipientEmail;
    private Expression body;
    private Expression subject;

    @Value("${formsflow.ai.app.url}")
    private String baseUrl;

    public void notify(DelegateTask delegateTask) {

        MailService mailService = MailServiceFactory.getService(getConfiguration());

        // Get the string value of the variables passed from the task
        String recipient = getRecipient(delegateTask.getExecution());
        String emailBody = getBody(delegateTask.getExecution());
        String emailSubject = getSubject(delegateTask.getExecution());
        String taskId = String.valueOf(delegateTask.getId());

        // Create empty request and interceptors for the SendMailInvocation
        SendMailRequest request = getRequest();
        List<ConnectorRequestInterceptor> requestInterceptors = getInterceptors();

        if (recipient != null && !recipient.isEmpty()) {

            try {
                Message message = createMessage(recipient, emailBody, emailSubject, taskId, mailService.getSession());
                SendMailInvocation invocation = new SendMailInvocation(message, request, requestInterceptors, mailService);

                invocation.proceed();

            } catch (Exception e) {
                throw new MailConnectorException("Failed to send mail: " + e.getMessage(), e);
            }

        }
    }

    protected Message createMessage(String recipient, String body, String subject, String taskId, Session session) throws Exception {
        MailConfiguration configuration = getConfiguration();
        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(configuration.getSender(), configuration.getSenderAlias()));
        message.setRecipients(RecipientType.TO, InternetAddress.parse(recipient));

        message.setSentDate(new Date());
        message.setSubject(subject);

        String bodyUrl = body.replace("$BASE_URL", baseUrl);
        String finalBody = bodyUrl.replace("$TASK_ID", taskId);

        if (!body.isEmpty()) {
            message.setText(finalBody);
        } else {
            message.setText("");
        }

        return message;
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

    public void setConfiguration(MailConfiguration configuration) {
        this.configuration = configuration;
    }


    /**
     * Generate empty interceptors
     *
     * @return ConnectorRequestInterceptor
     */
    private List<ConnectorRequestInterceptor> getInterceptors() {
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
    private SendMailRequest getRequest() {
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

    private String getRecipient(DelegateExecution delegateExecution) {
        return String.valueOf(this.recipientEmail.getValue(delegateExecution));
    }

    private String getBody(DelegateExecution delegateExecution) {
        return String.valueOf(this.body.getValue(delegateExecution));
    }

}
