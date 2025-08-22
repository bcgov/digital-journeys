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

    

  };

  etlForOds();

  console.log(data);
  
  const theForm = Object.values(window.Formio.forms)[0];
  theForm.submit();
  
  return true;

})();