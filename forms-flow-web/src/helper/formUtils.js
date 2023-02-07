const convertFormLinksToOpenInNewTabs = (formio, convertFormLinksInterval) => {
  if (formio) {
    clearInterval(convertFormLinksInterval);
    formio.everyComponent((component) => {
      if (component.component.html) {
        component.component.html = component.component.html.replace(
          /<a\s+href=/gi,
          '<a target="_blank" href='
        );
      }
    });
  }
  formio.redraw();
  return true;
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
    clearInterval(interval);
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
  const userIdentityProvider = username.split("_")[(username.split("_")).length - 1];
  return formSupportedIdentityProviders.some(el => el === userIdentityProvider);
};

export {
  convertFormLinksToOpenInNewTabs,
  scrollToErrorOnValidation,
  enableFormButton,
  getFormSupportedIdentityProviders,
  hasUserAccessToForm
};
