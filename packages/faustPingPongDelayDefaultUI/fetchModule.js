const fetchModule = async (url) => {
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
	return exported;
};
export default fetchModule;
