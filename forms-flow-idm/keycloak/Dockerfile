FROM quay.io/keycloak/keycloak:26.0.0

COPY ./realm-config/formsflow-ai-realm.json /opt/keycloak/data/import/realm-config.json

#ENTRYPOINT [ "sleep", "1000000" ]
ENTRYPOINT [ "/opt/keycloak/bin/kc.sh", "start-dev", "--http-relative-path=/auth", "--hostname-strict=false", "--import-realm", "--http-enabled=true" ]

# sh-5.1$ ./kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user admin
#Logging into http://localhost:8080/auth as user admin of realm master
#Enter password:
#sh-5.1$ ./kcadm.sh update realms/master -s sslRequired=NONE






