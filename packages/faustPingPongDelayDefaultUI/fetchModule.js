const fetchModule = async (url) => {
	const toExport = {};
	window.exports = toExport;
	window.module = { exports: toExport };
	const esm = await import(/* webpackIgnore: true */url);
	const esmKeys = Object.keys(esm);
	if (esmKeys.length === 1 && esmKeys[0] === 'default') return esm.default;
	if (esmKeys.length) return esm;
	const exported = window.module.exports;
	delete window.exports;
	delete window.module;
	return exported;
};
export default fetchModule;
