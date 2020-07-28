const path = require('path');
const Bundler = require('parcel-bundler');
const express = require('express');
const chalk = require('chalk');

const { webaudiomodules } = require('./package.json');

const app = express();

Object.entries(webaudiomodules).forEach(([moduleName, directory]) => {
	let webaudiomoduleDistPath;
	try {
		webaudiomoduleDistPath = path.dirname(require.resolve(path.join(moduleName, directory)));
	} catch (err) {
		let message = '';
		if (directory) {
			message = `\nVerify that "${directory}" directory exists in "${moduleName}" module directory.`;
		}
		console.log(chalk`{yellow 🚧🚧🚧
Cannot load webaudiomodule [{bold ${moduleName}}].${message}
Maybe ${moduleName} has not been built or linked yet ?
Have you executed the commands "{bold yarn lerna bootstrap}" and "{bold yarn build}" ?}`);
	}

	if (!webaudiomoduleDistPath) return;

	app.use(
		`/${moduleName}`,
		express.static(webaudiomoduleDistPath),
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
