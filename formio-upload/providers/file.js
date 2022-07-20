const _ = require('lodash');
const fs = require('fs-extra');
const Provider = require('./provider');
const uploadDir = process.env.UPLOAD_DIR || `${__dirname}/uploads`;
class LocalProvider extends Provider {
  static upload(file, dir) {
    const localDir = `${uploadDir}/${dir}`;
    return fs.ensureDir(localDir).then(() => {
      return fs.copy(file.path, `${localDir}/${file.filename}`).then(() => {
        file.url = '/' + encodeURIComponent(`${dir}/${file.filename}`);
        return file;
      });
    });
  }

  static download(path, req, res) {
    path = `${uploadDir}/${decodeURIComponent(path)}`;
    fs.stat(path, function(err, stat) {
      if (err) {
        return res.status(400).send(err.message || err);
      }

      req.debug(`Sending file ${res.filePath}`);
      res.set('Content-Length', stat.size);
      res.set('Content-Type', 'application/octet-stream');
      fs.createReadStream(path).pipe(res);
    });
  }
}

module.exports = LocalProvider;
