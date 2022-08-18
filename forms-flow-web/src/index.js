/* istanbul ignore file */
// import "core-js/stable";
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import StoreService from "./services/StoreService";
// import UserService from "./services/UserService";

import { Formio, Components, Templates } from 'react-formio';
import DGJFileUpload from './formComponents/FileUpload';
import RemoteSelect from './formComponents/RemoteSelect';
import {AppConfig} from './config';

import components from './customFormioComponents';
import './styles.scss';
import UploadProvider from './formComponents/UploadProvider';

// disable react-dev-tools for this project
if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object") {
  for (let [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value == "function" ? ()=>{} : null;
  }
}

const store = StoreService.configureStore();
const history = StoreService.history;

Formio.setProjectUrl(AppConfig.projectUrl);
Formio.setBaseUrl(AppConfig.apiUrl);

// Add custom file upload provider
Formio.Providers.addProvider('storage', 'digital-journeys', UploadProvider);
Components.setComponents(components);

// Override the default file upload component with the custom one to provide
// reasonable default values
Components.setComponent('file', DGJFileUpload);
// Adding a new RemoteSelect component extending original formio Select
Components.addComponent('remoteSelect', RemoteSelect);

ReactDOM.render(<App {...{ store, history }} />, document.getElementById("app"));
