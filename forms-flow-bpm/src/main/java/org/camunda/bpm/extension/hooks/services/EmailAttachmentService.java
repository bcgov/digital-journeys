package org.camunda.bpm.extension.hooks.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.activation.URLDataSource;
import javax.mail.util.ByteArrayDataSource;

import java.io.IOException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class EmailAttachmentService {
    private final Logger LOGGER = Logger.getLogger(EmailAttachmentService.class.getName());

    @Autowired
    private HTTPServiceInvoker httpServiceInvoker;

    @Value("${formsflow.ai.formio.url}")
    private String formioUrl;

    @Value("${formsflow.ai.documentApi.url}")
    private String documentApiUrl;

    /**
     * Retrieves the given attachment from the Formio file service as a URLDataSource
     * @param url url of the file
     * @param file details of the file to retrieve so the file service can check permissions
     * @return A URLDataSource of the given file
     * @throws IOException
     */
    public URLDataSource getAttachment(String url, JSONObject file) throws IOException {
        String payload = file.toString();
        ResponseEntity<String> res = httpServiceInvoker.execute(url, HttpMethod.POST, payload);

        if (res.getStatusCode().value() == HttpStatus.OK.value()) {
            if (StringUtils.isBlank(res.getBody())) {
                LOGGER.log(Level.SEVERE, "Unable to file for " + url);
                return null;
            }

            ObjectMapper m = new ObjectMapper();
            URLFileResponse resp = m.readValue(res.getBody(), URLFileResponse.class);

            return new URLDataSource(new URL(resp.getUrl()));

        }

        return null;
    }

    public ByteArrayDataSource generatePdf(String formId, String submissionId) throws IOException {
        String url = String.format("%s/form/%s/submission/%s/export/pdf", documentApiUrl, formId, submissionId);

        Mono<byte[]> pdfFile = httpServiceInvoker.exchangeForFile(url, HttpMethod.POST, null);

        return new ByteArrayDataSource(pdfFile.block(), "application/pdf");
    }
}
