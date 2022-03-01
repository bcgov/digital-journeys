const pkg = require('./package.json');
const express = require('express');
const _ = require('lodash');
const cors = require('cors');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const middleware = require('./middleware');
const app = express();
app.use(cors());
app.use(bodyParser.json({
  limit: (process.env.MAX_UPLOAD_SIZE || '16mb')
}));
app.use(methodOverride('X-HTTP-Method-Override'));

app.get('/status', (req, res, next) => {
  res.json({version: pkg.version});
});

/**
 * Add a new upload provider.
 *
 * @param name
 * @param Provider
 */
app.addProvider = function(name, Provider) {
  // Download the file.
  app.get(`/${name}/:fileId`,
    (req, res, next) => {
      if (!req.query.token) {
        return res.status(401).send('Unauthorized');
      }
      req.provider = Provider;
      next();
    },
    middleware.init('file'),
    Provider.init,
    middleware.auth,
    Provider.auth,
    (req, res) => Provider.download(req.params.fileId, req, res)
  );

  // Get a download url w/ temporary auth token.
  app.post(`/${name}/:fileId`,
    (req, res, next) => {
      req.provider = Provider;
      next();
    },
    middleware.init('downloadToken'),
    middleware.tempToken,
    (req, res) => res.json({url: req.body.url})
  );

  // Upload a file.
  app.post(`/${name}`,
    (req, res, next) => {
      req.provider = Provider;
      next();
    },
    middleware.init('upload'),
    Provider.init,
    middleware.auth,
    Provider.auth,
    middleware.upload,
    (req, res, next) => {
      if (req.response) {
        res.json(req.response);
      }
      else {
        res.send('Done');
      }
      next();
    },
    middleware.cleanup
  );
};

// Add the default providers.
if (process.env.PROVIDERS) {
  const enabled = process.env.PROVIDERS.split(',');
  const providers = require('./providers');
  _.each(providers, (Provider, name) => {
    if (enabled.includes(name)) {
      app.addProvider(name, Provider);
    }
  });
}

module.exports = app;