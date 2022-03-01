const fs = require('fs-extra');
const _ = require('lodash');
module.exports = (req, res, next) => {
  if (!req.cleanup || !req.cleanup.length) {
    req.debug('Nothing to cleanup');
    return next();
  }

  // Cleanup all files.
  _.each(req.cleanup, (file) => {
    try {
      req.debug(`Deleting file ${file}`);
      fs.unlink(file);
    }
    catch (err) {
      req.debug(`ERROR: Deleting File ${err.message || err}`);
      console.log(err);
    }
  });
  next();
};
