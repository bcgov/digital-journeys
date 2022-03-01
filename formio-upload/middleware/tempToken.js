const request = require('request');
const _ = require('lodash');
module.exports = function tempToken(req, res, next) {
  if (!req.body || !req.body.url) {
    return next('No file url provided.');
  }

  // Get the project and form.
  const url = _.get(req.body, 'data.baseUrl');
  const project = _.get(req.body, 'data.project');
  const form = _.get(req.body, 'data.form');
  const submission = _.get(req.body, 'data.submission');

  req.body.url += '?';
  if (url) {
    req.body.url += `baseUrl=${url}&`;
  }
  if (project) {
    req.body.url += `project=${project}&`;
  }
  if (form) {
    req.body.url += `form=${form}&`;
  }
  if (submission) {
    req.body.url += `submission=${submission}&`;
  }

  // If a project is provided and we are authenticated, then we can fetch a temp token that can only access
  // this submission for a limited time period.
  if (project && req.headers['x-jwt-token']) {
    request.get({
      url: `${url}/token`,
      json: true,
      headers: {
        'x-allow': `GET:/project/${project}/form/${form}/submission/${submission}`,
        'x-jwt-token': req.headers['x-jwt-token']
      }
    }, (err, response, body) => {
      if (err) {
        return next(err);
      }
      if (!body || !body.key) {
        return res.status(401).send('Unauthorized');
      }
      req.body.url += `token=${body.key}`;
      next();
    });
  }
  else {
    next();
  }
};