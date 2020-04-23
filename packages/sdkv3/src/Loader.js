/* eslint-disable lines-between-class-members */

/**
 * Loads the json plugin descriptor from url
 */
export async function loadPluginDescriptor(url) {
	url = new URL(url, window.location.href);
	const descriptor = await fetch(url).then((res) => res.json());
	descriptor.url = url;
	return descriptor;
}

const defaultOptions = {
	noGui: false,
};

export async function loadPluginFromDescriptor(descriptor, opts) {
	const {
		entry = './index.js',
		gui = './gui.js',
		url,
	} = descriptor;
	const entryModulePath = new URL(entry, url);
	const guiModuleUrl = gui === 'none' ? undefined : new URL(gui, url);
	const { default: Plugin } = await import(entryModulePath);

	const options = { ...defaultOptions, ...opts };
	// if gui wanted, we load it right now
	// if not wanted, the gui will be loaded when calling plugin.createGui()
	if (!options.noGui && guiModuleUrl) { await import(guiModuleUrl); }

	/**
	 * Extends Plugin with actual descriptor and gui module url
	 */
	class PluginWrapper extends Plugin {
		static descriptor = descriptor;
		static guiModuleUrl = guiModuleUrl;
	}

	return {
		Plugin: PluginWrapper,
		createPlugin: async (audioContext, pluginOptions = {}) => {
			const plugin = new PluginWrapper(audioContext, pluginOptions);
			await plugin.initialize(pluginOptions.initialState);
			return plugin;
		},
	};
}

export async function loadPlugin(url) {
	const descriptor = await loadPluginDescriptor(url);
	const plugin = await loadPluginFromDescriptor(descriptor);
	return plugin;
}
