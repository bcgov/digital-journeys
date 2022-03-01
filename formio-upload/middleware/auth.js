const request = require('request');

module.exports = function authenticate(req, res, next) {
  req.debug('Authenticating');
  
  // Require an auth token to get the file.
  if (req.method === 'GET' && !req.query.token) {
    return res.status(401).send('Unauthorized');
  }

  if (req.query.token) {
    request.get({
      url: `${req.query.baseUrl}/form/${req.query.form}/submission/${req.query.submission}`,
      json: true,
      qs: {token: req.query.token}
    }, (err, response, body) => {
      if (err) {
        return next(err);
      }
      if (!body._id) {
        return res.status(401).send('Unauthorized');
      }

      // We are able to load the submission, so we are authenticated to download this file.
      return next();
    });
  }
  else if (req.method === 'POST') {
    if (!req.query.form || !req.query.baseUrl) {
      return next('Form not found.');
    }

    // Get this user's assigned roles
    request.get({
      url: `${req.query.baseUrl}/current`,
      headers: {
        'x-jwt-token': req.headers['x-jwt-token']
      }
    }, (err, userResponse) => {
      if (err) {
        return next(err);
      }

      if (userResponse.statusCode !== 200) {
        return res.sendStatus(userResponse.statusCode);
      }

      let userBody = JSON.parse(userResponse.body)
      let userTeams = userBody.teams
      let userRoleIds = userBody.roles

      // If this is a superuser, check team permissions.
      if (userBody.project === process.env.PORTAL_BASE_PROJECT_ID) {
        // Find the user's teams
        request.get({
          url: `${req.query.baseUrl}`,
          headers: {
            'x-jwt-token': req.headers['x-jwt-token']
          }
        }, (err, projectResponse) => {
          if (err) {
            return next(err);
          }
  
          if (projectResponse.statusCode !== 200) {
            return res.sendStatus(projectResponse.statusCode);
          }
  
          let projectBody = JSON.parse(projectResponse.body)
          let teamAccess = projectBody.access.filter(access => access.type === 'team_access' || access.type === 'team_admin' )
          let teams = teamAccess[0].roles
          
          // Find intersection of userTeams and teams. 
          // i.e., see what teams are listed both in the project access and in the user permissions
          let intersect = userTeams.filter(value => teams.includes(value))
  
          // If there are any overlapping teams, user can be authenticated
          if(intersect.length > 0) {
            return next()
          }
          // If it fails on teams, it does not check roles
          return res.status(401).send('Unauthorized');
        });
      }
      else { // Not a superuser
        // Get roles with create access to the form
        request.get({
          url: `${req.query.baseUrl}/form/${req.query.form}`,
          headers: {
            'x-jwt-token': req.headers['x-jwt-token']
          }
        }, (err, formResponse) => {
          if (err) {
            return next(err);
          }

          if (formResponse.statusCode !== 200) {
            return res.sendStatus(formResponse.statusCode);
          }

          let formBody = JSON.parse(formResponse.body)
          let writeAccess = formBody.submissionAccess.filter(access => access.type === 'create_own' || access.type === 'create_all')
          let writeAccessRoles = []
          for (let access of writeAccess) {
            writeAccessRoles.push(...access.roles)
          }
          
          // Find intersection of writeAccessRoles and userRoleIds 
          // i.e., see what roles are listed both in the form create access and in the user permissions
          let intersect = userRoleIds.filter(value => writeAccessRoles.includes(value))

          // If there are any overlapping roles, user can be authenticated
          if(intersect.length > 0) {
            return next()
          }
          return res.status(401).send('Unauthorized');
        });
      }
    });
  }
  else {
    // Everything else is unauthorized.
    return res.status(401).send('Unauthorized');
  }
};