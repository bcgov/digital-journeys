const fs = require('fs');
const Provider = require('./provider');
const AlfrescoApi = require('alfresco-js-api-node');
const alfrescoApi = new AlfrescoApi({
  provider:'ECM',
  hostEcm:process.env.ALFRESCO_HOST
});
class AlfrescoProvider extends Provider {
  static auth(req, res, next) {
    req.debug('Authenticating');
    alfrescoApi.login(process.env.ALFRESCO_USER, process.env.ALFRESCO_PASS).then(function (data) {
      req.debug('Authenticated:' + JSON.stringify(data));
      req.ticket = data.ticket;
      next();
    }, (err) => next(JSON.stringify(err)));
  }

  static upload(file, dir) {
    return alfrescoApi.upload.uploadFile(
      fs.createReadStream(file.path),
      dir,
      null,
      {
        properties: {
          'cm:title': file.originalname
        }
      },
      {
        name: file.originalname,
        renditions: 'doclib',
        autoRename: true
      }
    ).then((response) => {
      response.entry.url = `/${response.entry.id}`;
      return response.entry;
    });
  }

  static download(fileId, req, res) {
    alfrescoApi.nodes.getNodeInfo(fileId).then((info) => {
      res.set('Content-Type', info.content.mimeType);
      res.set('Content-Length', info.content.sizeInBytes);
      alfrescoApi.core.nodesApi.getFileContent(fileId).then(data => res.send(data));
    }, err => res.status(400).send(err.message || err));
  }
}

module.exports = AlfrescoProvider;