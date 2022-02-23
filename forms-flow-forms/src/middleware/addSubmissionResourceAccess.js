'use strict';

const _ = require('lodash');
/**
 * Adds permissions specified on the submissions ACL to the access object.
 */
module.exports = (router) => {

  return function addAccessToRequest(req, res, next) {
    router.formio.cache.loadSubmissionAcl(req, req.params.formId, req.params.submissionId, function(err, acl) {
      if(err) {
        return next(`Cannot load acl for submission ${req.params.submissionId}`);
      }

      if(!acl) {
        return next();
      }

      if(!req.body.access) {
        req.body.access = [];
      }

      acl.access.forEach(a => req.body.access.push(a));

      return next();
    });
  }
};

