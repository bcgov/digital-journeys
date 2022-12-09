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

export {
  convertFormLinksToOpenInNewTabs,
  scrollToErrorOnValidation,
  enableFormButton,
};
