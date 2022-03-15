# Used as a reference for any custom logic to be done.
# if the application is built from a source repo other than aot , use the custom copying.
# steps : checkout the aot source code and use the copy logic.
# -----------------------------------------------------------

# Maven build

FROM mcr.microsoft.com/openjdk/jdk:11-ubuntu AS ubuntu-jdk

RUN apt-get update \
  && apt-get install -y curl git \
  && rm -rf /var/lib/apt/lists/*

ARG MAVEN_VERSION=3.8.4
ARG USER_HOME_DIR="/root"
ARG SHA=a9b2d825eacf2e771ed5d6b0e01398589ac1bfa4171f36154d1b5787879605507802f699da6f7cfc80732a5282fd31b28e4cd6052338cbef0fa1358b48a5e3c8
ARG BASE_URL=https://apache.osuosl.org/maven/maven-3/${MAVEN_VERSION}/binaries

RUN mkdir -p /usr/share/maven /usr/share/maven/ref \
  && curl -fsSL -o /tmp/apache-maven.tar.gz ${BASE_URL}/apache-maven-${MAVEN_VERSION}-bin.tar.gz \
  && echo "${SHA}  /tmp/apache-maven.tar.gz" | sha512sum -c - \
  && tar -xzf /tmp/apache-maven.tar.gz -C /usr/share/maven --strip-components=1 \
  && rm -f /tmp/apache-maven.tar.gz \
  && ln -s /usr/share/maven/bin/mvn /usr/bin/mvn

ENV MAVEN_HOME /usr/share/maven
ENV MAVEN_CONFIG "$USER_HOME_DIR/.m2"

FROM ubuntu-jdk AS bpm

RUN apt-get update \
    && apt-get install -y git lsyncd

ARG FORMIO_SOURCE_REPO_BRANCH
ARG FORMIO_SOURCE_REPO_URL

RUN git clone -b ${FORMIO_SOURCE_REPO_BRANCH} ${FORMIO_SOURCE_REPO_URL} /bpm/

COPY ./pom-docker.xml /tmp/pom.xml
COPY ./settings-docker.xml /usr/share/maven/ref/
COPY . /digital-journeys

WORKDIR /tmp/

# This allows Docker to cache most of the maven dependencies
RUN cp -rf /bpm/forms-flow-bpm/src/ /tmp/src/
RUN cp -rf /digital-journeys/src /tmp/

COPY lsyncd.conf ./

RUN mvn -s /usr/share/maven/ref/settings-docker.xml exec:java -e -Dmain.class=com.microsoft.playwright.CLI -Dexec.args="install-deps"

EXPOSE 8080

ENTRYPOINT ["/bin/bash", "-c", "lsyncd lsyncd.conf; mvn -s /usr/share/maven/ref/settings-docker.xml package; java -Djava.security.egd=file:/dev/./urandom -jar /tmp/target/forms-flow-bpm.jar"]