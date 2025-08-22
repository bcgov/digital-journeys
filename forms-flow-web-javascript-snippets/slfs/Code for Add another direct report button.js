// Code for Add another direct report button
(function () {
  
  const theForm = Object.values(window.Formio.forms)[0];

  const _form = {

    getComponent: (name, index=1) => {
      const component = theForm.getComponent(`directReports[${index}].${name}`);
      if (!component || typeof(component.getValue) != "function" ) {
        console.log(`Component not found: ${name}`);
      }
      return component ? component : null;
    }
  }
  
  let index = 0, component;
  
  for ( ; index<10; index++ ) {
    
    component = _form.getComponent("directReportEmailAddress", index);

    if ( component == null ) return;

    console.log("email at ", index, component.data.directReportEmailAddress);
    if ( component.data.directReportEmailAddress == null || component.data.directReportEmailAddress == undefined || component.data?.directReportEmailAddress.indexOf("@") < 0 ) {
      break;
    }
  }
  
  component.setValue("@");
  const action = _form.getComponent("selectOneOfTheFollowingOptions", index);
  action.setValue("changeThisDirectReport");
})();