# Apply theme changes
Existing keycloak setup using Openshift StafulSet `keycloak`.

Needs to add configMap of required file and attache it as volume to exiting pod.
>It will terminate and recreate pod, due to this keycloak service will be down for 5-10minutes.

### Steps to add configMaps
In below example consider bcgov theme for the keycloak login page.

__Step 1__ : Login in to oc cli.
> If you see any timeout error on login to oc cli. make sure your VPN points to canada, Or best way to do by connecting with BCGOV VPN before running below commands.

Click on username in the openshift console and click on ***copy login command***.
e.g `oc login --token=<apitoken> --server=<serverpath>`

__Step 2__ : Select project from the given list after login command run successfully.
e.b `oc project <projectname>`

__Step 3__ : Create ConfigMap
Needs to select all file that should attached with the configMaps. It will not read file reside under sub-directory hence we have to select it using absolute path.
> ConfigMap can create upto 1MB overall size. Also, If your mount file path cross any other file path in different ConfigMap then it will break and give CreateContainerError.
e.g.
```
oc create configmap themefilefont-bcgov \
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
--from-file=login/messages/messages_en.properties \
--from-file=login/resources/webfonts/BCSans-Regular.woff
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

        - name: kc-themefiles
          configMap:
            name: themefilefont-bcgov
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
              - key: BCSans-Regular.woff
                path: login/resources/webfonts/BCSans-Regular.woff
            defaultMode: 365
```

** Mount Volume**
```
volumeMounts:
            - name: <name>
              ... other configuration details
            - name: kc-themefiles
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

> If anything breaks in the pod restart.

> Change spec -> replocas: 0 and wait for it to terminate gracefully. Change back to 1 or 2 as per the requirements and save. It will start pod without fail (might need to follow this step 2-3 time in some cases).