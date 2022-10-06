FROM maven:3.8.1-openjdk-17-slim AS MAVEN_TOOL_CHAIN
RUN apt-get update \
 && apt-get install -y lsyncd
COPY pom*.xml /tmp/
COPY settings-docker.xml /usr/share/maven/ref/
COPY . /digital-journeys
RUN cp -rf /digital-journeys/src /tmp/

WORKDIR /tmp/
COPY lsyncd.conf ./

EXPOSE 8080
ENTRYPOINT ["/bin/bash", "-c", "lsyncd lsyncd.conf; mvn -s /usr/share/maven/ref/settings-docker.xml -Dmaven.test.skip=true package; java -Djava.security.egd=file:/dev/./urandom -jar /tmp/target/forms-flow-bpm.jar"]