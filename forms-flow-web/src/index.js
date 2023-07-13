/* istanbul ignore file */
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import StoreService from "./services/StoreService";
import { Formio, Components } from "react-formio";
import { AppConfig } from "./config";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "./styles.scss";
import "./resourceBundles/i18n.js";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { featureFlags } from "./featureToogle";
import { FlagsProvider } from 'flagged';
import FormioCustomEx from "formsflow-formio-custom-elements/dist/customformio-ex";

import DGJFileUpload from "./formComponents/FileUpload";
import RemoteSelect from "./formComponents/RemoteSelect";
import MinistrySelect from "./formComponents/MinistrySelect";
import UploadProvider from "./formComponents/UploadProvider";
import PanelComponent from "./formComponents/Panel";
import TextFieldComponent from "./formComponents/TextField";
import TextAreaComponent from "./formComponents/TextArea";
import DGJSelectComponent from "./formComponents/SelectComponent";
import DGJCurrencyComponent from "./formComponents/CurrencyComponent";

// disable react-dev-tools for this project
if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object") {
  for (let [key, value] of Object.entries(
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__
  )) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] =
      typeof value == "function" ? () => {} : null;
  }
}

const store = StoreService.configureStore();
const history = StoreService.history;

Formio.setProjectUrl(AppConfig.projectUrl);
Formio.setBaseUrl(AppConfig.apiUrl);
Components.setComponents(FormioCustomEx.components);
// Set custom formio elements - Code splitted

// Add custom file upload provider
Formio.Providers.addProvider("storage", "digital-journeys", UploadProvider);

// Override the default file upload component with the custom one to provide
// reasonable default values
Components.setComponent("file", DGJFileUpload);
Components.setComponent("panel", PanelComponent);
Components.setComponent("textfield", TextFieldComponent);
Components.setComponent("textarea", TextAreaComponent);
Components.setComponent("select", DGJSelectComponent);
Components.setComponent("currency", DGJCurrencyComponent);

// Adding two remote select components extending original formio Select
Components.addComponent("remoteSelect", RemoteSelect);
Components.addComponent("ministrySelect", MinistrySelect);


ReactDOM.render(
  <FlagsProvider features={featureFlags}>
     <App {...{ store, history }} />
  </FlagsProvider>,
  document.getElementById("app")
);

// Register service worker and if new changes skip waiting and activate new service worker
serviceWorkerRegistration.register({
  onUpdate: registration => {
    const waitingServiceWorker = registration.waiting;

    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", event => {
        if (event.target.state === "activated") {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  }
});
