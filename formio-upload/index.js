require('dotenv').config();
const app = require('./server');
app.listen((process.env.PORT || 80), () => console.log('File Upload Proxy Listening on ' + (process.env.PORT || 80)));
