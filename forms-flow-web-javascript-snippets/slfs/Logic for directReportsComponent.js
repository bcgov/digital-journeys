// Logic for directReportsComponent

const evt = arguments[17].events;
//console.log(arguments);

if ( evt.event == "formio.render" ) {
  return false;
}

if ( !data.email || data.email.indexOf("@") < 0 ) {  
  return console.log("No email found, skipping direct reports population");
}

if ( data.email == data._email ) {

  return;
}

data._email = data.email;

console.log("email ", data.email);

const apiUrl = localStorage.getItem("formsflow.ai.api.url");

const populate = async r => {

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
  
  const data = await r.json();
  if ( Array.isArray(data) && data.length > 0 ) {
    
    //console.log("Employee data fetched successfully:", data);

    const entries = new Array(10).fill(0);

    entries.forEach((_, index) => {

      const employee = data[index];

      const getComponent = key => {
        let idx = index;
        return _form.getComponent(`${key}`, idx);
      };

      if ( getComponent(`directReportEmailAddress`) == null ) return;

      if ( employee != null ) {

        console.log(employee)
 
        getComponent(`directReportEmailAddress`).setValue(employee.email);
        getComponent(`directReportName`).setValue(employee.last_name + ", " + employee.first_name);
        getComponent(`directReportEmployeeId`).setValue(employee.EMPLID);
        getComponent(`directReportPosition`).setValue(employee.position_title);
        getComponent(`directReportMinistry`).setValue(employee.Organization);
        getComponent(`directReportClassification`).setValue(employee.ClassificationGroup);
        getComponent(`directReportIdir`).setValue(employee.IDIR);

        // TODO
        getComponent(`directReportDivision`).setValue(employee.division);
      }

      let action = getComponent(`selectOneOfTheFollowingOptions`);
      if ( action == null ) return;

      action.events.on("formio.change", (args) => {

        const component = args.changed?.instance,
          value = args.changed?.value;

        //console.log("I changed my mind about ", component.path, action.path);
        if ( component == null || component.path != action.path ) return;

        //console.log(`Action changed for direct report ${index + 1}:`, value);

        if ( value == "removeThisDirectReport" /*|| value == "changeThisDirectReport" */) {

          getComponent(`directReportEmailAddress`).setValue("");
          getComponent(`directReportName`).setValue("");
        }
      });

      let dr = getComponent(`directReportRemoteSelect`);
      if ( dr == null ) return;

      dr.events.on("formio.change", (args) => {
        // Handle the change event for the directReportRemoteSelect component

        const component = args.changed?.instance,
          value = args.changed?.value;

        if ( component == null || value == null ) return;

        //console.log("I changed ", component.path, dr.path);
        if ( component.path != dr.path ) return;
        console.log(`Direct report ${index + 1} changed:`, value);

        getComponent(`directReportEmailAddress`).setValue(value.email);
        getComponent(`directReportName`).setValue(value.last_name + ", " + value.first_name);
        getComponent(`directReportEmployeeId`).setValue(value.EMPLID);
        getComponent(`directReportPosition`).setValue(value.position_title);
        getComponent(`directReportMinistry`).setValue(value.Organization);
        getComponent(`directReportClassification`).setValue(value.ClassificationGroup);
        getComponent(`directReportIdir`).setValue(value.IDIR);

        // TODO
        getComponent(`directReportDivision`).setValue(value.division);


        getComponent(`selectOneOfTheFollowingOptions`).setValue("acceptThisDirectReport");
        
      });

    });

  }

}

const qs = `supervisorEmail=${data.email}&wantMultiple=1&select=first_name,last_name,email,ClassificationGroup,EMPLID,IDIR,Organization,position_title`;

console.log(`Fetching employee data with query: ${qs}`);

fetch(`${apiUrl}/employee-data/info?${qs}`, {

  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
  }
}).then(populate);

