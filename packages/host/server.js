const path = require('path');
const Bundler = require('parcel-bundler');
const express = require('express');
const chalk = require('chalk');

const { webaudioplugins } = require('./package.json');

const app = express();

Object.entries(webaudioplugins).forEach(([moduleName, directory]) => {
	let webaudiopluginDistPath;
	try {
		webaudiopluginDistPath = path.dirname(require.resolve(path.join(moduleName, directory)));
	} catch (err) {
		let message = '';
		if (directory) {
			message = `\nVerify that "${directory}" directory exists in "${moduleName}" module directory.`;
		}
		console.log(chalk`{yellow 🚧🚧🚧
Cannot load webaudioplugin [{bold ${moduleName}}].${message}
Maybe ${moduleName} has not been built or linked yet ?
Have you executed the commands "{bold yarn lerna bootstrap}" and "{bold yarn build}" ?}`);
	}

	if (!webaudiopluginDistPath) return;

	app.use(
		`/${moduleName}`,
		express.static(webaudiopluginDistPath),
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
