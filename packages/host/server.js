const Bundler = require('parcel-bundler');
const express = require('express');
var cors = require('cors')
const app = express();

// fix : https://github.com/parcel-bundler/parcel/issues/1315#issuecomment-523524186
app.get('/', (req, res, next) => {
	req.url = '/index.html';
	next();
});

app.use(cors())
app.use('/packages', express.static('../'));

const bundler = new Bundler('src/*.html');
app.use(bundler.middleware());

app.listen(1234);

console.info('Host server started on http://localhost:1234');
