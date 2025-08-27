// Code for submit button

(function (subs) { 
  
  const constructEmailAddresses = (source, key) => {
    const emails = data[source].map(e => e[`${key}EmailAddress`]).filter(e => e != null && e.indexOf("@") > 0);

    return emails.join(",");

  };

  data.colleaguesEmailAddresses = constructEmailAddresses("colleagueList", "colleague");
  data.directReportsEmailAddresses = constructEmailAddresses("directReports", "directReport");

  const etlForOds = () => {
    // Perform ETL operations for ODS
    console.log("Performing ETL for ODS...");

    const payload = {

      cohort: data.cohort,
      submission_datetime: new Date().toISOString(),
      sl_email: data.email,
      sl_emplid:  data.empId,
      sl_name: data.lastName + "," + data.firstName,
      sl_position: data.positionTitle,
      sl_classification: 'TODO',
      sl_ministry: data.organization,
      sl_division: data.divisionLevel2,
      sl_idir: data.userIdir,
      super_emplid: data.supervisorEmployeeId,
      super_email: data.supervisorEmailAddress,
      super_name: data.supervisorLastName+ ", " + data.supervisorFirstName,
      super_idir: data.supervisorIdir,
      super_position: data.supervisorPositionTitle,
      super_classification: data.supervisorClassification,
      super_ministry: data.supervisorMinistry,
      super_division: data.supervisorDivision,
      dreps: data.directReports.map(report => {
        return {
          idir: report.directReportIdir,
          emplid: report.directReportEmployeeId,
          email: report.directReportEmailAddress,
          name: report.directReportName,
          position: report.directReportPosition,
          classification: report.directReportClassification,
          ministry: report.directReportMinistry,
          division: report.directReportDivision
        };
      }).filter(report => report.email && report.name),
      colleagues: data.colleagueList.map(colleague => {
        return {
          idir: colleague.colleagueIdir,
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

  //_form.getComponent("odsPayload").setValue(data.odsPayload);
  _form.getComponent("directReportsEmailAddresses").setValue(data.directReportsEmailAddresses);
  _form.getComponent("colleaguesEmailAddresses").setValue(data.colleaguesEmailAddresses);

  for ( let key in data.odsPayload ) {
    _form.getComponent(key).setValue(data.odsPayload[key]);
  }

  theForm.submit();
  
  return true;

})(submission);