/** @type {Window & { fetchModuleCache?: Map }} */
const globalThis = window;

const cache = globalThis.fetchModuleCache || new Map();

const fetchModule = async (url) => {
	const absoluteUrl = new URL(url, import.meta.url).href;
	if (cache.has(absoluteUrl)) return cache.get(absoluteUrl);
	let exported;
	const toExport = {};
	window.exports = toExport;
	window.module = { exports: toExport };
	const esm = await import(/* webpackIgnore: true */url);
	const esmKeys = Object.keys(esm);
	if (esmKeys.length) exported = esm;
	else exported = window.module.exports;
	delete window.exports;
	delete window.module;
	cache.set(absoluteUrl, exported);
	return exported;
};

if (!globalThis.fetchModuleCache) globalThis.fetchModuleCache = cache;

export default fetchModule;
