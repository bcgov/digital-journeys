# Apply theme changes
Existing keycloak setup using Openshift StafulSet `keycloak`.

Needs to add configMap of required file and attache it as volume to exiting pod.
>It will terminate and recreate pod, due to this keycloak service will be down for 5-10minutes.

### Steps to add configMaps
In below example consider bcgov theme for the keycloak login page.

__Step 1__ : Login in to oc cli.
> Make sure are connected with BCGOV VPN before running below commands.

Click on username in the openshift console and click on ***copy login command***.
e.g `oc login --token=<apitoken> --server=<serverpath>`

__Step 2__ : Select project from the given list after login command run successfully.
e.b `oc project <projectname>`

__Step 3__ : Create ConfigMap
Needs to select all file that should attached with the configMaps. It will not read file reside under sub-directory hence we have to select it using absolute path.
e.g.
```
oc create configmap keycloak-themev-bcgov \
--from-file=login/login-reset-password.ftl \
--from-file=login/login-update-password.ftl \
--from-file=login/login.ftl \
--from-file=login/template.ftl \
--from-file=login/theme.properties \
--from-file=login/resources/img/gov_bc_logo.svg \
--from-file=login/resources/img/favicon.ico \
--from-file=login/resources/css/bcgov-header.min.css \
--from-file=login/resources/css/bcgov-login.css \
--from-file=login/resources/css/kc-app.min.css \
--from-file=login/resources/css/kc-base.min.css \
--from-file=login/messages/messages_en.properties 
```
### Steps to apply configMap into SatefulSet

__Step 1__ : Go to openshift console and select StatefulSet under the project.
in our case it is`keycloak`.
__Step 2__:  Go to YAML file and edit below details.

__Add new Volume__
- Select configMap
- Add Items
    - Key: FIle Name
    - Path: Selected file's destination path. (it will be relative path)

E.g.
```
volumes:
        - name: <name>
          ... (details of volume goes here)

        - name: kc-theme
          configMap:
            name: keycloak-theme-bcgov
            items:
              - key: login-reset-password.ftl
                path: login/login-reset-password.ftl
              - key: login-update-password.ftl
                path: login/login-update-password.ftl
              - key: login.ftl
                path: login/login.ftl
              - key: template.ftl
                path: login/template.ftl
              - key: theme.properties
                path: login/theme.properties
              - key: gov_bc_logo.svg
                path: login/resources/img/gov_bc_logo.svg
              - key: favicon.ico
                path: login/resources/img/favicon.ico
              - key: bcgov-header.min.css
                path: login/resources/css/bcgov-header.min.css
              - key: bcgov-login.css
                path: login/resources/css/bcgov-login.css
              - key: kc-app.min.css
                path: login/resources/css/kc-app.min.css
              - key: kc-base.min.css
                path: login/resources/css/kc-base.min.css
              - key: messages_en.properties
                path: login/messages/messages_en.properties
            defaultMode: 365
```

** Mount Volume**
```
volumeMounts:
            - name: <name>
              ... other configuration details
            - name: kc-theme
              readOnly: true
              mountPath: /opt/jboss/keycloak/themes/bcgov/login
              subPath: login
```

How it will save file in the instance/pod.
File: `gov_bc_logo.svg`
File Path: `login/resources/img/gov_bc_logo.svg`
mountPath: `/opt/jboss/keycloak/themes/bcgov/<login>`

Final absolute path will be,
`/opt/jboss/keycloak/themes/bcgov/login/resources/img/gov_bc_logo.svg`

__Step 3__ : Save YAML file, It will terminate exiting container and re-create new one.