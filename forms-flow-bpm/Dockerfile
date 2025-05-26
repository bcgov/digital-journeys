FROM maven:3.8.1-openjdk-17-slim AS MAVEN_TOOL_CHAIN
RUN apt-get update   && apt-get install -y lsyncd
COPY pom*.xml /tmp/
COPY settings-docker.xml /usr/share/maven/ref/
COPY . /digital-journeys
RUN cp -rf /digital-journeys/src /tmp/

WORKDIR /tmp/
COPY lsyncd.conf ./

EXPOSE 8080
#ENTRYPOINT ["/bin/bash", "-c", "lsyncd lsyncd.conf; mvn -s /usr/share/maven/ref/settings-docker.xml -Dmaven.test.skip=true package; java -Dlogging.level.org.springframework.web.client.RestTemplate=DEBUG -Dlogging.level.org.springframework.security.oauth2.client=TRACE -Dlogging.level.org.springframework.security.oauth2=DEBUG -Dlogging.level.org.springframework.boot.autoconfigure.security=DEBUG -Dlogging.level.org.camunda=DEBUG -Dlogging.level.org.springframework.security=DEBUG -Djava.security.egd=file:/dev/./urandom -jar /tmp/target/forms-flow-bpm.jar"]

# PB Maxed error logging for debugging
ENTRYPOINT ["/bin/bash", "-c", "lsyncd lsyncd.conf; mvn -s /usr/share/maven/ref/settings-docker.xml -Dmaven.test.skip=true package;  java    -Dlogging.level.org.springframework.web.client.RestTemplate=DEBUG    -Dlogging.level.org.springframework.security.oauth2.client=TRACE    -Dlogging.level.org.springframework.security.oauth2=DEBUG    -Dlogging.level.org.springframework.boot.autoconfigure.security=DEBUG    -Dlogging.level.org.camunda=DEBUG    -Dlogging.level.org.camunda.bpm.engine=DEBUG    -Dlogging.level.org.camunda.bpm.rest=DEBUG    -Dlogging.level.org.springframework.security=DEBUG    -Dlogging.level.org.springframework.security.web=DEBUG    -Dlogging.level.org.springframework.boot.autoconfigure=TRACE    -Dlogging.level.org.hibernate.SQL=DEBUG    -Dlogging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE    -Djava.security.egd=file:/dev/./urandom    -jar /tmp/target/forms-flow-bpm.jar"]
