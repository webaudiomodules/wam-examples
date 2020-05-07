const path = require('path');
const Bundler = require('parcel-bundler');
const express = require('express');
const { webaudioplugins } = require('./package.json');

const app = express();

Object.entries(webaudioplugins).forEach(([moduleName, directory]) => {
	app.use(
		`/${moduleName}`,
		express.static(path.dirname(require.resolve(path.join(moduleName, directory)))),
	);
});

// fix : https://github.com/parcel-bundler/parcel/issues/1315#issuecomment-523524186
app.get('/', (req, res, next) => {
	req.url = '/index.html';
	next();
});

const bundler = new Bundler('src/*.html');
app.use(bundler.middleware());

app.listen(1234);

console.info('Host server started on http://localhost:1234');
