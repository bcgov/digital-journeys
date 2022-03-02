const os = require('os');
const multer  = require('multer');
const upload = multer({
  dest: os.tmpdir()
});
module.exports = function uploadFile(req, res, next) {
  req.debug(`Uploading file`);
  upload.single('file')(req, res, (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file || !req.file.path) {
      return next('File not uploaded');
    }

    // Add the uploaded file to cleanup task.
    req.debug(`Uploaded file ${req.file.path}`);
    req.cleanup.push(req.file.path);
    req.provider.upload(req.file, req.body.dir).then(entity => {
      req.response = entity;
      req.debug(`Uploaded file ${entity.url}`);
      return next();
    }, err => next(err));
  });
};