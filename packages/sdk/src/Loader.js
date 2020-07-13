/* eslint-disable lines-between-class-members */

const defaultLoadOptions = {
	noGui: false,
};
/**
 * Loads the json plugin descriptor from url
 */
export const getDescriptorFromUrl = async (url) => {
	url = new URL(url, window.location.href);
	const descriptor = await fetch(url, { mode: 'no-cors' }).then((res) => res.json());
	descriptor.url = url;
	return descriptor;
};

export const loadPluginFromDescriptor = async (descriptor, optionsIn) => {
	const {
		entry = './index.js',
		gui = './gui.js',
		url,
	} = descriptor;
	const entryModuleUrl = new URL(entry, url);
	const guiModuleUrl = gui === 'none' ? undefined : new URL(gui, url);
	const { default: PluginClass } = await import(/* webpackIgnore: true */entryModuleUrl);

	const options = { ...defaultLoadOptions, ...optionsIn };
	// if gui wanted, we load it right now
	// if not wanted, the gui will be loaded when calling plugin.createGui()
	if (!options.noGui && guiModuleUrl) { await import(/* webpackIgnore: true */guiModuleUrl); }

	/**
	 * Extends Plugin with actual descriptor and gui module url
	 */
	PluginClass.descriptor = descriptor;
	PluginClass.guiModuleUrl = guiModuleUrl;

	return PluginClass;
};

export const loadPluginFromUrl = async (url, options) => {
	const descriptor = await getDescriptorFromUrl(url);
	const plugin = await loadPluginFromDescriptor(descriptor, options);
	return plugin;
};
