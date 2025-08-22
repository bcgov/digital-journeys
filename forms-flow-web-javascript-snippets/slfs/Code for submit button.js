// Code for submit button

(function () { 
  
  const constructEmailAddresses = (key) => {
    const emails = data[`${key}s`].map(e => e[`${key}EmailAddress`]).filter(e => e != null && e.indexOf("@") > 0);

    data[`${key}sEmailAddresses`] = emails.join(",");

  };
  
  constructEmailAddresses("colleague");
  constructEmailAddresses("directReport");

  const etlForOds = () => {
    // Perform ETL operations for ODS
    console.log("Performing ETL for ODS...");

    const payload = {
      
      cohort: data.cohort,
      SubmissionDateTime: new Date().toISOString(),
      email: data.email,
      SL_emplid:  data.empId,
      SL_name: data.lastName + "," + data.firstName,
      SL_position: data.positionTitle,
      SL_classification: 'TODO',
      SL_ministry: data.organization,
      SL_division: data.divisionLevel2,
      SL_IDIR: data.userIdir,
      super_emplid: data.supervisorEmployeeId,
      super_email: data.supervisorEmailAddress,
      super_name: data.supervisorLastName+ ", " + data.supervisorFirstName,
      super_IDIR: data.supervisorIdir,
      super_position: data.supervisorPositionTitle,
      super_classification: data.supervisorClassification,
      super_ministry: data.supervisorMinistry,
      super_division: data.supervisorDivision,
      drep: data.directReports.map(report => {
        return {
          IDIR: report.directReportIdir,
          emplid: report.directReportEmployeeId,
          email: report.directReportEmailAddress,
          name: report.directReportName,
          position: report.directReportPosition,
          classification: report.directReportClassification,
          ministry: report.directReportMinistry,
          division: report.directReportDivision
        };
      }).filter(report => report.email && report.name),
      colleague: data.colleagues.map(colleague => {
        return {
          IDIR: colleague.colleagueIdir,
          emplid: colleague.colleagueEmployeeId,
          email: colleague.colleagueEmailAddress,
          name: colleague.colleagueName,
          position: colleague.colleaguePosition,
          classification: colleague.colleagueClassification,
          ministry: colleague.colleagueMinistry,
          division: colleague.colleagueDivision
        };
      }).filter(colleague => colleague.email && colleague.name)
    };

    data.odsPayload = payload;

  };

  
  etlForOds();
  
  console.log(data);

  const theForm = Object.values(window.Formio.forms)[0];

  const _form = {

    getComponent: (name) => {
      const component = theForm.getComponent(`${name}`);
      if (!component || typeof(component.getValue) != "function" ) {
        console.log(`Component not found: ${name}`);
      }
      return component ? component : null;
    }
  }

  _form.getComponent("odsPayload").setValue(data.odsPayload);
  _form.getComponent("directReportsEmailAddresses").setValue(data.directReportsEmailAddresses);
  _form.getComponent("colleaguesEmailAddresses").setValue(data.colleaguesEmailAddresses);

  theForm.submit();
  
  return true;

})();