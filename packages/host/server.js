const Bundler = require('parcel-bundler');
const express = require('express');
const cors = require('cors');

const app = express();

// fix : https://github.com/parcel-bundler/parcel/issues/1315#issuecomment-523524186
app.get('/', (req, res, next) => {
	req.url = '/index.html';
	next();
});

app.use((req, res, next) => {
	res.header('Cross-Origin-Embedder-Policy', 'require-corp');
	res.header('Cross-Origin-Opener-Policy', 'same-origin');
	next();
});

app.use('/packages', express.static('../'));

const bundler = new Bundler('src/*.html');
app.use(bundler.middleware());

app.listen(1234);

console.info('Host server started on http://localhost:1234');
