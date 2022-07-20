const pkg = require('./package.json');
const express = require('express');
const _ = require('lodash');
const cors = require('cors');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const middleware = require('./middleware');
const helmet = require('helmet')
const morgan = require('morgan')
const jwtDecode = require('jwt-decode');
const debug = require('debug');

const log = debug('endpoint');

const app = express();
app.use(helmet())
app.use(cors());

app.use(bodyParser.json({
  limit: (process.env.MAX_UPLOAD_SIZE || '16mb')
}));
app.use(methodOverride('X-HTTP-Method-Override'));


morgan.token('user', function(req, res) {
  const token = req.headers['x-jwt-token'] || req.query?.token;

  if(!token) {
    return 'anonymous';
  }

  const decoded = jwtDecode(token);
  return decoded?.sub || decoded?.user?._id;
});

// Remove token query param from all routes.
morgan.token('url', (req, res) => {
  const url = req.path;
  const queryParams = req.query;

  Object.keys(queryParams).forEach(key => {
    if (key.match(/secret|pass|token|key|pwd/i)) {
      queryParams[key] = '<REDACTED>';
    }
  });

  const qs = _.map(queryParams, (value, key) => `${key}=${value}`).join('&');

  if(qs?.length) {
    return url + '?' + qs;
  }
  return url;
});

app.use(morgan(':remote-addr :user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'));

app.get('/status', (req, res, next) => {
  res.json({version: pkg.version});
});

/**
 * Generate a pdf version of the given file
 */
app.get(`/pdf`, (req, res, next) => {
  if (!req.query.token && !req.headers['x-jwt-token']) {
    return res.status(401).send('Unauthorized');
  }
  
  next();
},
  middleware.init('generatePdf'),
  middleware.auth,
  middleware.generatePdf,
)


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