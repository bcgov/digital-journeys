'use strict';

const _ = require('lodash');
const util = require('../util/util');
/**
 * Adds permissions passed in by an admin to the given submissions ACL
 */
module.exports = (router) => {
  const hook = require('../util/hook')(router.formio);

  return function bootstrapSubmissionResourceAccess(req, res, next) {
    // Only add on PUT/POST.
    if (!(req.method === 'POST' || req.method === 'PUT')) {
      return next();
    }

    // Only add access if the user is an admin.
    if(!req.isAdmin) {
      return next();
    }

    // No formid / submission supplied
    if(!req.params.formId || !req.params.submissionId) {
      return next();
    }

    // No access supplied
    if(!req.body.access) {
      return next();
    }

    try {
      // Load existing acl for submission
      router.formio.cache.loadSubmissionAcl(req, req.params.formId, req.params.submissionId, function(err, acl) {
        if(err) {
          return next(`Cannot load acl for submission ${req.params.submissionId}`);
        }
  
        if(!acl) {
          acl = [];
        }

        // Add new access as supplied in request
        acl = acl.concat(req.body.access.map(a => (
          {type: a.type, resources: a.resources.map(r => util.idToString(r))}
        )));

        // Persist the access
        router.formio.mongoose.models.submissionAcl.create(hook.alter('submissionAcl', {
          form: req.params.formId,
          submission: req.params.submissionId,
          access: acl
        }, req), (err, acl) => {
          return next();
        });    
      });  

    } catch (err) {
      return next();
    }
  };
};
