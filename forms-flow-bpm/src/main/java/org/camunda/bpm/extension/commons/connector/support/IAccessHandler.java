package org.camunda.bpm.extension.commons.connector.support;

import org.apache.commons.lang.NotImplementedException;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import reactor.core.publisher.Mono;

/**
 * This class defines the AccessHandler implementation.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
public interface IAccessHandler {
    ResponseEntity<String> exchange(String url, HttpMethod method, String payload);

    default Mono<byte[]> exchangeForFile(String url, HttpMethod method, String payload) {
        throw new NotImplementedException();
    }
}
