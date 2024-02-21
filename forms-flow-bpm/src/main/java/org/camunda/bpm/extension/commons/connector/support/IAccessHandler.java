package org.camunda.bpm.extension.commons.connector.support;

import org.camunda.bpm.extension.commons.ro.req.IRequest;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.apache.commons.lang3.NotImplementedException;

import java.util.Map;

import reactor.core.publisher.Mono;

/**
 * IAccess Handler.
 * This class defines the AccessHandler implementation.
 */
public interface IAccessHandler {

    /**
     * exchange function using json - string payload / string response
     * @param url
     * @param method
     * @param payload
     * @return
     */
    ResponseEntity<String> exchange(String url, HttpMethod method, String payload);
    ResponseEntity<String> exchange(String url, HttpMethod method, String payload, Boolean isUpdate);

    /**
     * exchange function using the custom class
     * @param url
     * @param method
     * @param payload
     * @param responseClazz
     * @return
     */
    ResponseEntity<IResponse> exchange(String url, HttpMethod method, IRequest payload, Class<? extends IResponse> responseClazz);


    ResponseEntity<String> exchange(String url, HttpMethod method, Map<String, Object> queryParams, IRequest payload);

    default Mono<byte[]> exchangeForFile(String url, HttpMethod method, String payload) {
        throw new NotImplementedException();
    }
}
