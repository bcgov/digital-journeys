<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/bcgov/digital-journeys">
    <img src="forms-flow-web/public/bcmark.png" alt="Logo" width="150" height="150">
  </a>

  <h1 align="center">PSA - Digital Journeys</h1>

  <p align="center">
    Form Builder and Workflow manager built on top of <a href="https://github.com/AOT-Technologies/forms-flow-ai">formsflow.ai</a>.
    <br />
    <a href="https://digital-journeys-dev.apps.silver.devops.gov.bc.ca"><strong>Dev Env »</strong></a>
    <br />
    <br />
    <a href="https://github.com/bcgov/digital-journeys/issues">Backlog</a>
    ·
    <a href="https://github.com/bcgov/digital-journeys/issues">Report Bug</a>
    ·
    <a href="https://github.com/bcgov/digital-journeys/issues">Request Feature</a>
  </p>
</div>


## About The Project

This repo contains a BC Gov branded version of [formsflow.ai](https://github.com/AOT-Technologies/forms-flow-ai) that will support public facing and internal Digital Journeys used by PSA and their employees.

<p align="right">(<a href="#top">back to top</a>)</p>



### Built With

This project is built on top of [formsflow.ai](https://github.com/AOT-Technologies/forms-flow-ai) which combines Redash, form.io, Camunda, and a custom built Web app to provide a form and workflow management system. See the [formsflow.ai](https://github.com/AOT-Technologies/forms-flow-ai) for a deeper dive into the different components of the system.

* Camunda
* form.io
* ReDash
* Keycloak
* Openshift
* Postgresql
* MongoDB
* Java
* Python (flask)
* React

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* Docker / docker-compose

### Installation

In order to get started with local development, please follow the steps below

1. Create a `.env` file in the root of the project. Please contact a project dev to get a working one.
2. Run the app
   ```sh
    make run-local
   ```
   be patient, this might take a while the first time :)
3. Once the project is up and running, you can access the web app at localhost:3000.
4. Update the User role env variables in the `.env` file according to the [Formsflow documentation](https://github.com/AOT-Technologies/forms-flow-ai/tree/master/forms-flow-forms#user-content-formsflow-forms-userrole-api) seeing as these are unique per installation. You can use either the `sh` script provided there or the postman collection. **Note:** If you're using the `resourceId_*.sh` script, you need to run it from within the docker container.
5. Restart the application, and you should be good to go!

<p align="right">(<a href="#top">back to top</a>)</p>



## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>


