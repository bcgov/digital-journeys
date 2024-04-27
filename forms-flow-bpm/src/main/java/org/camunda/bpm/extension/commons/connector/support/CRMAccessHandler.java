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
import org.springframework.web.client.HttpClientErrorException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;


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

        try {
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", crmAuthHeader)
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .header("osvc-crest-application-context", "Retrieve Data");

            if (method == HttpMethod.GET) {
                requestBuilder.GET();
            } else if (method == HttpMethod.POST) {
                requestBuilder.POST(HttpRequest.BodyPublishers.ofString(payload));
            } // Add other HTTP methods as needed

            HttpRequest request = requestBuilder.build();

            HttpResponse<String> httpResponse = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() >= 400 && httpResponse.statusCode() < 500) {
                System.out.println(httpResponse.body());
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST);
            } else if (httpResponse.statusCode() >= 500) {
                throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR);
            }

            return new ResponseEntity<>(httpResponse.body(), HttpStatus.valueOf(httpResponse.statusCode()));

        } catch (Exception e) {
            // Handle exceptions
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    public ResponseEntity<String> exchange(String url, HttpMethod method, String payload, Boolean isUpdate) {
        // Note: to handle isUpdate as ENUM for DELETE and other method override for CRM.
        payload = (payload == null) ? new JsonObject().toString() : payload;
        try {
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", crmAuthHeader)
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .header("osvc-crest-application-context","Update Incident")
                    .header("X-HTTP-Method-Override","PATCH");

            if (method == HttpMethod.POST) {
                requestBuilder.POST(HttpRequest.BodyPublishers.ofString(payload));
            } // Add other HTTP methods as needed

            HttpRequest request = requestBuilder.build();

            HttpResponse<String> httpResponse = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() >= 400 && httpResponse.statusCode() < 500) {
                System.out.println(httpResponse.body());
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST);
            } else if (httpResponse.statusCode() >= 500) {
                throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR);
            }

            return new ResponseEntity<>(httpResponse.body(), HttpStatus.valueOf(httpResponse.statusCode()));
        } catch (Exception e) {
            // Handle exceptions
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
