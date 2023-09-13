package org.camunda.bpm.extension.commons.connector.support;

import com.google.gson.JsonObject;

import java.util.Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.springframework.security.oauth2.client.web.reactive.function.client.ServerOAuth2AuthorizedClientExchangeFilterFunction.clientRegistrationId;


/**
 * This class serves as gateway for all CRM service interactions.
 */
@Service("CRMAccessHandler")
public class CRMAccessHandler extends AbstractAccessHandler {

    private final Logger LOGGER = LoggerFactory.getLogger(CRMAccessHandler.class);

    @Autowired
    private WebClient unauthenticatedWebClient;

    @Value("${formsflow.ai.crm.security.token}")
    private String crmAuthHeader;

    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload) {
        payload = (payload == null) ? new JsonObject().toString() : payload;

        Mono<ResponseEntity<String>> entityMono = unauthenticatedWebClient.method(method).uri(url)
                .header("Authorization", crmAuthHeader)
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("osvc-crest-application-context", "Retrieve Data")
                .body(Mono.just(payload), String.class)
                .retrieve()
                .toEntity(String.class);

        ResponseEntity<String> response = entityMono.block();
        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }

    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload, Boolean isUpdate) {
        // Note: to handle isUpdate as ENUM for DELETE and other method override for CRM.
        System.out.println("CRM request update headers");
        payload = (payload == null) ? new JsonObject().toString() : payload;
        Mono<ResponseEntity<String>> entityMono = unauthenticatedWebClient.method(method).uri(url)
                .header("Authorization", crmAuthHeader)
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("osvc-crest-application-context","Update Incident")
                .header("X-HTTP-Method-Override","PATCH")
                .body(Mono.just(payload), String.class)
                .retrieve()
                .toEntity(String.class);

        ResponseEntity<String> response = entityMono.block();
        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }
}
