FROM quay.io/keycloak/keycloak:26.0.0

COPY ./realm-config/formsflow-ai-realm.json /opt/keycloak/data/import/realm-config.json

ENTRYPOINT [ "/opt/keycloak/bin/kc.sh", "start-dev", "--http-relative-path=/auth", "--hostname-strict=false", "--import-realm" ]