#!/usr/bin/env node

const fs = require('fs');
const Bundler = require('parcel-bundler');
const openInBrowser = require('parcel-bundler/lib/utils/openInBrowser');
const express = require('express');
const debounce = require('lodash.debounce');
const { program } = require('commander');

program
	.option('-p, --port <port>', 'listening on port', '1234')
	.option('-d, --out-dir <dir>', 'directory of plugin', 'dist')
	.option('-e, --entry <glob>', 'entry point of example as glob', 'example/**/*.html')
	.option('-o, --open <browser>', 'open in browser', undefined)
	.parse(process.argv);

const app = express();

// fix : https://github.com/parcel-bundler/parcel/issues/1315#issuecomment-523524186
app.get('/', (req, res, next) => {
	req.url = '/index.html';
	next();
});

app.use(
	'/plugin',
	express.static(`${program.outDir}`),
);

const bundler = new Bundler(program.entry);
app.use(bundler.middleware());

app.listen(program.port);

const reload = debounce(() => {
	console.info('🔄 dist folder change => reload');
	bundler.hmr.broadcast({ type: 'reload' });
}, 200);

const watchRegex = new RegExp(`^${program.outDir}/`);
console.log('watchRegex', watchRegex);

fs.watch('.', { recursive: true }).on('change', (_, filename) => {
	if (watchRegex.test(filename)) reload();
});

const url = `http://localhost:${program.port}`;

console.info(`Host server started on ${url}`);

if (program.open !== 'false') {
	openInBrowser(url, program.open);
}
