// Logic for supervisor select


const evt = ([...arguments].pop() || [{}])[0] || {};
const { changed={instance: {}} } = evt;

/*
console.log(arguments);
console.log(evt);
console.log(changed);
console.log(instance);
*/

if ( instance.id !== changed.instance.id ) return;

const theForm = Object.values(window.Formio.forms)[0];

const _form = {

  getComponent: (name) => {
    const component = theForm.getComponent(name);
    if (!component || typeof(component.getValue) != "function" ) {
      console.log(`Component not found: ${name}`);
    }
    return component ? component : null;
  },
  apiUrl: () => {
    
    return localStorage.getItem("formsflow.ai.api.url");
  }

}

console.log({ input });

if (_.isObject(input) && Object.keys(input).length > 0) {
   
  console.log('Supervisor change');


  const fields = [
    ['EMPLID', 'supervisorEmployeeId'],
    ['position_title', 'supervisorPositionTitle'],
    [(input) => input['name'].split(/,/).shift(), 'supervisorLastName'],
    [(input) => input['name'].split(/,/).slice(1).join(' '), 'supervisorFirstName'],
    ['email', 'supervisorEmailAddress'],
    ['IDIR', 'supervisorIdir']
  ];

  const control = fields[0];

  if (_form.getComponent(control[1]).getValue() != input[control[0]]) {
 
    fields.forEach(([inputField, formField]) => {

      if ( inputField == null ) {
        _form.getComponent(formField).setValue("");
        console.log(`Setting ${formField} to BLANK`);
        return;
      }

      if ( _form.getComponent(formField) !== null) {
        const newValue = typeof inputField === 'function' ? inputField(input) : input[inputField];
        console.log(`Setting ${formField} to ${newValue}?`);
        if (_form.getComponent(formField).getValue() != newValue) {
          _form.getComponent(formField).setValue(newValue);
        }
      }
    });

    /*
    if ( input['IDIR'] == null ) {

      console.log('Fetching employee data for supervisor...');

      const response = fetch(_form.apiUrl() + '/employee-data/info?employeeId=' + _form.getComponent('supervisorEmployeeId').getValue(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
      })

      response.then(r => {
        r.json().then(data => {
          console.log('Employee data fetched successfully:', data);
          const { email, IDIR } = data;

          _form.getComponent('supervisorEmailAddress').setValue(email);
          _form.getComponent('supervisorIdir').setValue(IDIR);
        });
      });
    }
    */

    
  }
  else {
    console.log(`No changes detected for ${control[1]}`);
  }

}