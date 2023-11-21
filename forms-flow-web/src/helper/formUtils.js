import Utils from 'formiojs/utils';

const convertFormLinksToOpenInNewTabs = (form) => {
  Utils.eachComponent(
    form.components,
    (component) => {
      if (component.html) {
        component.html = component.html.replace(
          /<a\s+href=/gi,
          '<a target="_blank" href='
        );
      }
    },
    true
  );
};

const setValueForComponents = (formio, valueForComponentsInterval, keyValuePairs) => {
    clearInterval(valueForComponentsInterval);
    formio.everyComponent((component) => {
      keyValuePairs.forEach(keyValuePair => {
        if (component.component.key === keyValuePair.key) {
          component.setValue(keyValuePair.value);
        }
      });
    });
};

const scrollToErrorOnValidation = (formio, scrollToErrorInterval) => {
  if (formio) {
    clearInterval(scrollToErrorInterval);
    formio.on("checkValidity", () => {
      const componentsWithErrors = [];
      formio.everyComponent((component) => {
        if (component.error) {
          componentsWithErrors.push(component);
        }
      });
      componentsWithErrors[0]?.scrollIntoView();
    });
  }
};

const enableFormButton = (formio, enableButtonInterval, buttonKey, onClick) => {
  if (formio) {
    clearInterval(enableButtonInterval);
    const button = document.getElementsByName(`data[${buttonKey}]`)[0];
    if (button) {
      button.removeAttribute("disabled");
      const pdfName = formio._data?.name;
      const formName = formio._data?.formName;
      if (onClick) {
        button.onclick = () => onClick({ pdfName, formName });
      }
    }
  }
};

const getFormSupportedIdentityProviders = (formio, key, interval) => {
  let formSupportedIdentityProviders = [];
  if (formio) {
    if (interval) {
      clearInterval(interval);
    }
    formio.everyComponent((component) => {
      if (component.component.key === key){
        // Parse identity providers string (e.g., idir,bceid or idir) into an array
        formSupportedIdentityProviders = component.component?.defaultValue?.replace(/\s/g, '')?.split(",");
      }
    });
  }
  return formSupportedIdentityProviders;
};

const hasUserAccessToForm = (formSupportedIdentityProviders, username) => {
  /* Usernames have postfix with the name the identity provider the user logged in with
   * for example a user that was logged in by IDIR has a username of "username_idir", one logged in with BCeID has username of "username_bceid"
  */
  // Parse the identity provider part of the user's username
  if (username) {
    const userIdentityProvider = username.split("_")[(username.split("_")).length - 1];
    return formSupportedIdentityProviders.some(el => el === userIdentityProvider);
  } else {
    return false;
  }
};

const getDefaultValues = (data, form, page = '') => {
  if (form === undefined) {
    return {};
  }
  if (Object.keys(data)?.length === 0 || form.components?.length === 0) {
    return;
  }

  // A recursive function to get all the key properties of the form
  function findAllKeys(obj, target) {
    const keys = [];
    const fnd = (obj) => {
      if (!obj || Object.entries(obj).length === 0) {
        return;
      }
      for (const [k, v] of Object.entries(obj)) {
        if (k === target) {
          if (page === 'draft') {
            // If draft let's check fields are diabled or not
            // If disabled then and then fetch new value
            if (Object.getOwnPropertyDescriptor(data, v)) {
              if (obj.disabled) {
                keys.push(v);
              }
            } else {
              keys.push(v);
            }
          } else {
            keys.push(v);
          }
        }
        if (typeof v === "object") {
          fnd(v);
        }
      }
    };
    fnd(obj);
    return keys;
  }
  const keys = findAllKeys(form.components, "key");
  const uniqueKeys = [...new Set(keys)];

  const filteredComponents = uniqueKeys?.filter((comp) => {
    const dataArray = Object.keys(data);
    if (comp.includes("_")) {
      return dataArray.some((dataItem) => comp.split("_")[0] === dataItem);
    }
    return dataArray.some((el2) => comp === el2);
  });

  const defaultValuesArray = filteredComponents?.map((filteredComp) => {
    if (filteredComp.includes("_")) {
      return {
        [filteredComp]: data[filteredComp.split("_")[0]],
      };
    }
    return { [filteredComp]: data[filteredComp] };
  });

  const defaultValuesObject = defaultValuesArray?.reduce(
    (acc, curr) => ({ ...acc, ...curr }),
    {}
  );

  return { data: defaultValuesObject };
};

const getFormSupportedIDPFromJSON = (formio) => {
  if (formio?.supportedidp && formio.supportedidp !== "") {
    return formio.supportedidp;
  }
  return null;
};

function mergeFormioAccessRoles(array1, array2) {
  const mergedArray = [];

  // Helper function to merge roles by type
  const mergeRoles = (obj, array) => {
    const existingObj = array.find(item => item.type === obj.type);
    if (existingObj) {
      existingObj.roles = [...new Set([...existingObj.roles, ...obj.roles])];
    } else {
      array.push({ ...obj, roles: [...new Set([...obj.roles])] });
    }
  };

  // Iterate through array1 and merge roles by type
  array1.forEach(obj => {
    mergeRoles(obj, mergedArray);
  });

  // Iterate through array2 and merge roles by type
  array2.forEach(obj => {
    mergeRoles(obj, mergedArray);
  });

  return mergedArray;
}

export {
  convertFormLinksToOpenInNewTabs,
  scrollToErrorOnValidation,
  enableFormButton,
  getFormSupportedIdentityProviders,
  hasUserAccessToForm,
  getDefaultValues,
  getFormSupportedIDPFromJSON, 
  setValueForComponents,
  mergeFormioAccessRoles
};
