// Code for Add another direct report button
(function () {
  
  const theForm = Object.values(window.Formio.forms)[0];

  const _form = {

    getComponent: (name, index=0) => {
      const component = theForm.getComponent(`directReports[${index}].${name}`);
      if (!component || typeof(component.getValue) != "function" ) {
        console.log(`Component not found: ${name}`);
      }
      return component ? component : null;
    }
  }
  
  let index = 0;
  
  for ( ; index<10; index++ ) {
    
    let component;
    
    component = _form.getComponent("directReportEmailAddress", index);

    if ( component == null ) return;

    console.log("email at ", index, component.data.directReportEmailAddress);
    if ( component.data.directReportEmailAddress == null || component.data.directReportEmailAddress == undefined || component.data?.directReportEmailAddress.indexOf("@") < 0 ) {
      
      const node = document.querySelector(`tbody[data-key='datagrid-directReports'] > tr:nth-child(${index + 1})`);
      if ( node != null ) {

        node.style.display = "";
      }      

      const action = _form.getComponent("selectOneOfTheFollowingOptions", index);
      action.setValue("changeThisDirectReport");
      
      break;
    }
  
  
  }

})();