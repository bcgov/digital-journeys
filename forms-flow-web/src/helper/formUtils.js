const convertFormLinksToOpenInNewTabs = (formio, convertFormLinksInterval) => {
  if (formio) {
    clearInterval(convertFormLinksInterval);
    formio.everyComponent((component) => {
      if (component.component.html) {
        component.component.html = component.component.html.replace(
          /<a\s+href=/gi,
          '<a target="_blank" href='
        );
        formio.redraw();
      }
    });
  }
};

const scrollToErrorOnValidation = (formio, scrollToErrorInterval) => {
  if (formio) {
    clearInterval(scrollToErrorInterval);
    formio.on("checkValidity", (_) => {
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

export { convertFormLinksToOpenInNewTabs, scrollToErrorOnValidation };