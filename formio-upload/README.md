Form.io File Upload Server
-------------------------
This library provides an Upload Server/Proxy for use with the Form.io File Component and URL configuration. 
This allows for **Private file upload and downloads** by sending Authentication requests to the Form.io API Server
to determine if a user has permissions to upload or download based on their access to either Submit the form, or fetch the Submission JSON respectively.

## Getting Started
This library can be ran within 3 different environments.

  1. Locally using Node.js
  2. Docker container
  3. AWS Lambda
  
### Running locally with Node.js
In order to run this server locally, you can type the following within your terminal.

```
npm install
node index
```

### Running within Docker
To run this with docker, you can use the following commands.

```
docker run -itd \
  -e "PORT=4100" \
  -e "MAX_UPLOAD_SIZE=16mb" \
  -e "DEBUG=*" \
  -e "PROVIDERS=file,alfresco" \
  -e "UPLOAD_DIR=" \
  -e "ALFRESCO_USER=admin" \
  -e "ALFRESCO_PASS=admin" \
  -e "ALFRESCO_HOST=http://127.0.0.1:8082" \
  --restart unless-stopped \
  --name formio-upload \
  -p 4100:4100 \
  formio/formio-upload
```

### Running within AWS Lambda
Before you can run with AWS Lambda, you must first install [Claudia](https://claudiajs.com).

```
npm install claudia -g
```

Next, you will want to configure your access credentials to the AWS CLI. You can do this by following the instructions @ [https://claudiajs.com/tutorials/installing.html](https://claudiajs.com/tutorials/installing.html)

Once you have access setup, you can now modify the deploy scripts within ```package.json``` to change where this script will be deployed. Once you have made changes to the ```deploy``` script within ```package.json```, you can now run the following to deploy this within AWS Lambda using the deploy script.

```
npm run deploy
```  
  
### Environment Variables. 
You must use Environment variables to configure the runtime operation of this server. When running this server locally using Node.js, you can set the Environment variables within the ```.env``` file. These variables are defined as follows.


| Variable | Description | Default |
|----------|-------------|---------|
| PORT | The port you wish to run the server on. | 4100 |
| MAX_UPLOAD_SIZE | The maximum upload size for files being uploaded. | 16mb |
| DEBUG | Enables debugging | * |
| PROVIDERS | Determines which upload providers are enabled. This is a CSV of the providers you wish to enable. For example "file,alfresco" will enable both local file uploads as well as Alfresco ECM uploads. | file |
| UPLOAD_DIR | When using the "file" provider, this is the local upload base directory. | providers/uploads |
| ALFRESCO_USER | When using the Alfresco provider, this is the user account to log into the Alfresco ECM | admin |
| ALFRESCO_PASS | When using the Alfresco provider, this is the user account password to log into the Alfresco ECM | admin |
| ALFRESCO_HOST | When using the Alfresco provider, this is the Alfresco ECM server URL | http://127.0.0.1:8082 |

## Configure Form Upload
Now that you have the server running, you can configure a Form.io Form with a new File component.

![Alt text](https://monosnap.com/image/hyuWKj6MGKMFvNXQ5Es1XqOE5M3CCc.png)

Within the configuration of this File component, you will need to set the file upload type to **URL** and then provide the URL of this service. You can decide which upload provider to use based on the path you provide to the url of the running server.

For example:

 - **http://localhost:4100/file** - Uses the local file upload provider.
 - **http://localhost:4100/alfresco** - Uses the Alfresco ECM upload provider.
 
You will also need to make sure you check **Private Download**. Your configuration should look something like the following.

![Alt text](https://monosnap.com/image/OVJ2E3kJA63xbhPlrCaKj3ecPOxsGw.png)

The upload will now function against this server.
