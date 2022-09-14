/**
 * Custom Formio Upload provider for Digital Journeys.
 * This provider is based on the built in URL provider, but handles graceful integration with the formio-upload package,
 * and will work with a dynamic file upload url per environment.
 * https://github.com/formio/formio.js/blob/ab210814dcf12f12bc7da7517223fdeae638789f/src/providers/storage/url.js
 */

import NativePromise from "native-promise-only";
import axios from "axios";
import { FORMIO_FILE_URL } from "../../constants/constants";

const url = (formio) => {
  const xhrRequest = (
    url,
    name,
    query,
    data,
    options,
    progressCallback,
    abortCallback
  ) => {
    return new NativePromise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const json = typeof data === "string";
      const fd = new FormData();

      if (typeof progressCallback === "function") {
        xhr.upload.onprogress = progressCallback;
      }

      if (typeof abortCallback === "function") {
        abortCallback(() => xhr.abort());
      }

      if (!json) {
        for (const key in data) {
          fd.append(key, data[key]);
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Need to test if xhr.response is decoded or not.
          let respData = {};
          try {
            respData =
              typeof xhr.response === "string" ? JSON.parse(xhr.response) : {};
            respData = respData && respData.data ? respData.data : respData;
          } catch (err) {
            respData = {};
          }

          // Get the url of the file.
          let respUrl = Object.prototype.hasOwnProperty.call(respData, "url")
            ? respData.url
            : `${xhr.responseURL}/${name}`;

          // If they provide relative url, then prepend the url.
          if (respUrl && respUrl[0] === "/") {
            respUrl = `${url}${respUrl}`;
          }
          resolve({ url: respUrl, data: respData });
        } else {
          reject(xhr.response || "Unable to upload file");
        }
      };

      xhr.onerror = () => reject(xhr);
      xhr.onabort = () => reject(xhr);

      let requestUrl = url + (url.indexOf("?") > -1 ? "&" : "?");
      for (const key in query) {
        requestUrl += `${key}=${query[key]}&`;
      }
      if (requestUrl[requestUrl.length - 1] === "&") {
        requestUrl = requestUrl.substr(0, requestUrl.length - 1);
      }

      xhr.open("POST", requestUrl);
      if (json) {
        xhr.setRequestHeader("Content-Type", "application/json");
      }
      const token = formio.getToken();
      if (token) {
        xhr.setRequestHeader("x-jwt-token", token);
      }

      //Overrides previous request props
      if (options) {
        const parsedOptions =
          typeof options === "string" ? JSON.parse(options) : options;
        for (const prop in parsedOptions) {
          xhr[prop] = parsedOptions[prop];
        }
      }
      xhr.send(json ? data : fd);
    });
  };

  return {
    title: "Digital Journeys",
    name: "digital-journeys",
    uploadFile(
      file,
      name,
      dir,
      progressCallback,
      url,
      options,
      fileKey,
      groupPermissions,
      groupId,
      abortCallback
    ) {
      const uploadRequest = function (form, submissionId) {
        return xhrRequest(
          FORMIO_FILE_URL,
          name,
          {
            baseUrl: encodeURIComponent(formio.projectUrl),
            project: form ? form.project || "dgj" : "",
            form: form ? form._id : "",
            submission: submissionId || "",
          },
          {
            [fileKey]: file,
            name,
            dir,
          },
          options,
          progressCallback,
          abortCallback
        ).then((response) => {
          // Store the project and form url along with the metadata.
          response.data = response.data || {};
          response.data.baseUrl = formio.projectUrl;
          response.data.project = form ? form.project || "dgj" : "";
          response.data.form = form ? form._id : "";
          return {
            storage: "digital-journeys",
            name,
            url: response.url,
            size: file.size,
            type: file.type,
            data: response.data,
          };
        });
      };

      if (formio.formId) {
        return formio
          .loadForm()
          .then((form) => uploadRequest(form, formio.submissionId));
      } else {
        return uploadRequest();
      }
    },
    deleteFile(fileInfo) {
      return new NativePromise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("DELETE", fileInfo.url, true);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve("File deleted");
          } else {
            reject(xhr.response || "Unable to delete file");
          }
        };
        xhr.send(null);
      });
    },

    downloadFile(file) {
      if (formio.submissionId && file.data) {
        file.data.submission = formio.submissionId;
      }

      return (
        xhrRequest(file.url, file.name, {}, JSON.stringify(file))
          .then((response) => response.data)
          // File upload server returns a signed url that can be used to download the file:
          .then((data) => axios.get(data.url, { responseType: "blob" }))
          .then((response) => ({
            ...file,
            // Override the storage type so the default file handling can kick in and actually download the file to the users machine
            storage: "base64",
            url: response.data,
          }))
      );
    },
  };
};

url.title = "Digital Journeys";
export default url;
