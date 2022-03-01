# Used as a reference for any custom logic to be done.
# if the application is built from a source repo other than aot , use the custom copying.
# steps : checkout the aot source code and use the copy logic.
# -----------------------------------------------------------

# Maven build
FROM maven:3.6.1-jdk-11-slim AS MAVEN_TOOL_CHAIN

RUN apt-get update \
    && apt-get install -y git lsyncd

ARG FORMIO_SOURCE_REPO_BRANCH
ARG FORMIO_SOURCE_REPO_URL

RUN git clone -b ${FORMIO_SOURCE_REPO_BRANCH} ${FORMIO_SOURCE_REPO_URL} /bpm/

#RUN cp /bpm/forms-flow-bpm/pom-docker.xml /tmp/pom.xml
#RUN cp /bpm/forms-flow-bpm/settings-docker.xml /usr/share/maven/ref/
COPY ./pom-docker.xml /tmp/pom.xml
COPY ./settings-docker.xml /usr/share/maven/ref/
COPY . /digital-journeys

WORKDIR /tmp/

# This allows Docker to cache most of the maven dependencies
RUN cp -rf /bpm/forms-flow-bpm/src/ /tmp/src/
RUN cp -rf /digital-journeys/src /tmp/

COPY lsyncd.conf ./

RUN mvn -s /usr/share/maven/ref/settings-docker.xml exec:java -e -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install-deps"
RUN mvn exec:java -e -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install-deps"
EXPOSE 8080

ENTRYPOINT ["/bin/bash", "-c", "lsyncd lsyncd.conf; mvn -s /usr/share/maven/ref/settings-docker.xml package; java -Djava.security.egd=file:/dev/./urandom -jar /tmp/target/forms-flow-bpm.jar"]
