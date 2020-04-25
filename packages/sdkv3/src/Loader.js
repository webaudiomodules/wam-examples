/* eslint-disable lines-between-class-members */
// eslint-disable-next-line max-classes-per-file
export default class Loader {
	static defaultLoadOptions = {
		noGui: false,
	}
	/**
	 * Loads the json plugin descriptor from url
	 */
	static async getDescriptorFromUrl(url) {
		url = new URL(url, window.location.href);
		const descriptor = await fetch(url).then((res) => res.json());
		descriptor.url = url;
		return descriptor;
	}

	static async loadPluginFromDescriptor(descriptor, optionsIn) {
		const {
			entry = './index.js',
			gui = './gui.js',
			url,
		} = descriptor;
		const entryModuleUrl = new URL(entry, url);
		const guiModuleUrl = gui === 'none' ? undefined : new URL(gui, url);
		const { default: PluginClass } = await import(entryModuleUrl);

		const options = { ...this.defaultOptions, ...optionsIn };
		// if gui wanted, we load it right now
		// if not wanted, the gui will be loaded when calling plugin.createGui()
		if (!options.noGui && guiModuleUrl) { await import(guiModuleUrl); }

		/**
		 * Extends Plugin with actual descriptor and gui module url
		 */
		PluginClass.descriptor = descriptor;
		PluginClass.guiModuleUrl = guiModuleUrl;

		return PluginClass;
	}

	static async loadPluginFromUrl(url) {
		const descriptor = await this.getDescriptorFromUrl(url);
		const plugin = await this.loadPluginFromDescriptor(descriptor);
		return plugin;
	}
}
