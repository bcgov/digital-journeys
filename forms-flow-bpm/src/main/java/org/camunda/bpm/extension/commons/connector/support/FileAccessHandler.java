package org.camunda.bpm.extension.commons.connector.support;

import com.google.gson.JsonObject;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.camunda.bpm.extension.commons.connector.FormioTokenServiceProvider;
import org.camunda.bpm.extension.commons.connector.support.FormAccessHandler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

import java.net.URLEncoder;


/**
 * This class serves as gateway for all formio interactions.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Service("fileAccessHandler")
public class FileAccessHandler extends FormAccessHandler {

    private final Logger logger = LoggerFactory.getLogger(FileAccessHandler.class.getName());
    static final int TOKEN_EXPIRY_CODE = 401;

    @Autowired
    private NamedParameterJdbcTemplate bpmJdbcTemplate;

    @Autowired
    private WebClient unauthenticatedWebClient;

    @Autowired
    private FormioTokenServiceProvider formioTokenServiceProvider;

    @Override
    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {
        return exchange(url, method, payload, formioTokenServiceProvider.getAccessToken());
    }

    @Override
    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload, String accessToken) {
        payload = (payload == null) ? new JsonObject().toString() : payload;

        return unauthenticatedWebClient.method(method)
                .uri(url )
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("x-jwt-token", accessToken)
                .body(Mono.just(payload), String.class)
                .retrieve()
                .onStatus(HttpStatus::is4xxClientError,
                        response -> Mono.error(new FormioServiceException(response.toString())))

                .toEntity(String.class)
                .block();
    }

    @Override
    protected Integer getExpiryCode() {
        return TOKEN_EXPIRY_CODE;
    }
}
