const express = require('express');

const app = express();

app.use((req, res, next) => {
	res.header('Cross-Origin-Embedder-Policy', 'require-corp');
	res.header('Cross-Origin-Opener-Policy', 'same-origin');
	next();
});

app.use('/', express.static('../'));

app.listen(1234);

console.info('Host server started on http://localhost:1234/host/');
