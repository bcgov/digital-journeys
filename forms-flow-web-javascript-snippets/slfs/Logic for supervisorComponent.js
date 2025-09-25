// Logic for supervisorComponent

(function() {

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

  const slEmail = _form.getComponent('supervisorEmailAddress');

  
  slEmail.events.on("formio.change", args => {
    
    const changed = args.changed;
    
    if ( changed == null && args.data != null && args.data?.managerEmail.indexOf("@") > 0 ) {
      
      console.log('Fetching employee data for supervisor...', args.data.managerEmail);

      const response = fetch(_form.apiUrl() + '/employee-data/info?email=' + args.data.managerEmail, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
      });
      
      response.then(r => {
        r.json().then(data => {
          console.log('Employee data fetched successfully:', data);
          const { IDIR, ClassificationGroup, Organization, EMPLID, position_title, level2_division, name } = data;
          
          _form.getComponent('supervisorFirstName').setValue(name.split(/,/).slice(1).join(' '));
          _form.getComponent('supervisorLastName').setValue(name.split(/,/).shift());
          _form.getComponent('supervisorIdir').setValue(IDIR);
          _form.getComponent('supervisorDivision').setValue(level2_division);
          _form.getComponent('supervisorClassification').setValue(ClassificationGroup);
          _form.getComponent('supervisorMinistry').setValue(Organization);
          _form.getComponent('supervisorEmployeeId').setValue(EMPLID);
          _form.getComponent('supervisorPositionTitle').setValue(position_title);
        });
      });
    }
  })
})();