const Bundler = require('parcel-bundler');
const express = require('express');

const app = express();

// fix : https://github.com/parcel-bundler/parcel/issues/1315#issuecomment-523524186
app.get('/', (req, res, next) => {
	req.url = '/index.html';
	next();
});

app.use('/packages', express.static('../'));

const bundler = new Bundler('demo/src/*.html', {hmr: false});
app.use(bundler.middleware());

app.listen(1234);

console.info('Demo server started on http://localhost:1234');
