const request = require('request');
const generatePdf = require('../pdf-generation/generatePdf');

/**
 * 
 * @param {*} req 
 * @returns 
 */
const fetchForm = (baseUrl, formId, token) => new Promise((resolve, reject) => {
  request.get({
    url: `${baseUrl}/form/${formId}`,
    json: true,
    headers: {
      'x-jwt-token': token
    }
  }, async (err, response, body) => {
    if (err) {
      reject(err);
    }
    
    resolve(body)
  });
})


/**
* Generate pdf for the submission of the given request
* @returns response with generated pdf
*/
module.exports = async function generatePdfResponse(req, res, next) {

  const authToken = req.query?.token || req.headers['x-jwt-token'];
  // Make sure submission has been loaded
  // and auth headers are present
  if (!authToken || !req.submission) {
    return res.status(401).send('Unauthorized');
  }
  
  try {
    // Load form definition from FormIO
    const form = await fetchForm(req.query.baseUrl, req.query.form, authToken)
    
    if(!form._id) {
      return res.status(401).send('Unauthorized');
    }
    
    // Generate and return pdf
    const pdf = await generatePdf(form, req.submission);
    
    res.set('Content-disposition', 'attachment; filename=test.pdf');
    res.set('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdf, 'binary'));
    
    // We are able to load the submission, so we are authenticated to download this file.
    return next();
    
  } catch(e) {
    next(e);
  }
};
