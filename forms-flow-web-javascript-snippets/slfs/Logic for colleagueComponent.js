// Logic for colleagueComponent

//const evt = arguments[17].events;

//if ( evt.event == "formio.render" ) {
  //return false;
//}

const hooks = (theForm) => {

  //const theForm = Object.values(window.Formio.forms)[0];

  const _form = {

    getComponent: (name, index=0) => {
      
      let component;
      
      try
      {
        component = theForm.getComponent(`colleagueList[${index}].${name}`);
      }
      catch {
        
        console.log(`Path does not exist: colleagueList[${index}].${name}`);
        return null;
      }
        
      if (!component || typeof(component.getValue) != "function" ) {
        console.log(`Component not found: ${name}`);
      }
      return component ? component : null;
    }
  }
  
  
  const entries = new Array(10).fill(0);

  entries.forEach((_, index) => {
    const getComponent = key => {
        let idx = index;
        return _form.getComponent(`${key}`, idx);
      };

    if ( getComponent(`colleagueEmailAddress`) == null ) return;

    const action = getComponent(`colleagueRemoteSelect`);
    if ( action == null ) return;

    action.events.on("formio.change", (args) => {
      const component = args.changed?.instance,
      value = args.changed?.value;
      
      //console.log(args)
      if ( component == null || value == null ) return;
      if ( component == null || component.path != action.path ) return;

      //console.log("Value: "); 
      //console.log(value);
      
    if (value && Object.keys(value).length === 0) {
        //console.log(getComponent(`colleagueEmailAddress`));
        getComponent(`colleagueEmailAddress`).setValue("");
        getComponent(`colleagueName`).setValue("");
        getComponent(`colleagueEmployeeId`).setValue("");
        getComponent(`colleaguePosition`).setValue("");
        getComponent(`colleagueMinistry`).setValue("");
        getComponent(`colleagueClassification`).setValue("");
        getComponent(`colleagueIdir`).setValue("");

        //   // TODO
        getComponent(`colleagueDivision`).setValue("");
        return;
      }

      
      
      if ( getComponent(`colleagueEmailAddress`) == null ) return;

      console.log("Colleague component selected:", getComponent(`colleagueEmailAddress`));
      getComponent(`colleagueEmailAddress`).setValue(value.email);
      getComponent(`colleagueName`).setValue(value.name);
      getComponent(`colleagueEmployeeId`).setValue(value.EMPLID);
      getComponent(`colleaguePosition`).setValue(value.position_title);
      getComponent(`colleagueMinistry`).setValue(value.Organization);
      getComponent(`colleagueClassification`).setValue(value.ClassificationGroup);
      getComponent(`colleagueIdir`).setValue(value.IDIR);

      // TODO
      getComponent(`colleagueDivision`).setValue(value.division);
      
    });

  });

}


const runWhenFormReady = (callback, attempts = 20) => {
  const forms = Object.values(window.Formio.forms || {});
  const form = forms[0];
 
  if (!form) {
    if (attempts > 0) {
      console.log("Waiting for form to be available...");
      setTimeout(() => runWhenFormReady(callback, attempts - 1), 200);
    } else {
      console.warn("Form not found after waiting.");
    }
    return;
  }
 
  callback(form);
};
 
runWhenFormReady((form) => {
  hooks(form);
});
