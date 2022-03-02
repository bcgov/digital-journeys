class Provider {
  static init(req, res, next) { next(); }
  static auth(req, res, next) { next(); }
  static upload(file, dir) { return Promise.resolve({}); }
  static download(fileId, req, res) { return res.send('No file found'); }
}

module.exports = Provider;