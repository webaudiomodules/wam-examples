# webaudiomodule

## Structure

This is a monorepo with multiple packages located under the directory `packages/`.

List of (relevant) packages
- `host`: a very simple host built with parceljs
- `sdk`: draft of the new sdk
- `pingpongdelay`: a simple PingPongDelay plugin based on the previous version from Michel
- `livegain`: LiveGain plugin from Shihong

## Main dependencies

The projet mainly uses the following packages for development :
- [yarn](https://www.npmjs.com/package/yarn) : replacement of npm
- [lerna](https://www.npmjs.com/package/lerna) : monorepo (multiple packages repository) manager
- [babel](https://www.npmjs.com/package/@babel/core) : ES6 transpiler
- [rollup](https://www.npmjs.com/package/rollup) : Module bundler (compatible es6 modules ouput)

## Installation

1. Install dependencies

```sh
yarn install
```

2. Initliaze monorepo dependencies using lerna

```sh
yarn lerna bootstrap
```

## Getting started

### Commands

Available scripts :

- `yarn build`: builds sdk and plugins (you may also use scripts `build:sdk`, `build:pingpongdelay` etc..)
- `yarn start`: starts the host example (for development only). Open [http://localhost:1234](http://localhost:1234)
- `yarn clean`: deletes built code

(other scripts can be found in /package.json)

### Create a plugin

For this example we will create a very simple plugin named simplegain

1. Create a plugin package

Create a package under packages directory using [lerna create](https://github.com/lerna/lerna/tree/master/commands/create)

Plugin creation is explained in the following section [Writing a plugin](#writing-a-plugin).

Example:
```sh
yarn lerna create simplegain
```

2. Test your plugin in a host

The host package allows to test plugins loaded thanks to the sdk plugin loader.
In order to test your plugin, you have to create a new html file in the src folder inside the package `host`.
The html file may also link a JavaScript file that will load the plugin and play some sound etc.

__lerna dependency__
lerna allows to symlinks monorepo packages between each other as regular package dependencies.
In order to use a plugin in the host, you must install the dependency.
Using lerna:
(replace "simplegain" with your own plugin module name)
```sh
yarn lerna add simplegain --scope host
```

__Parcel__
The host is built with parcel which allows to write modern JavaScript with no efforts.
Parcel allows for example to use ES6 static imports, loading assets from JavaScript etc.

__sdk plugin loader__
The plugin loader uses es6 dynamic imports to load the plugins through HTTP.
Thus every plugin code (descriptor.json, audio module, gui) must be available through a Web server.

The host package provides a simple utility that make a plugin avaiable through a web server.
In order to make your plugin available, it must be listed in the `webaudiomodules` field
of the `package.json` of the host.

Example :
```json
...
  "webaudiomodules": {
    "livegain": "dist",
    "pingpongdelay": "dist"
  }
...
```

`webaudiomodules` field is a map of [packageName, buildDirectory].
buildDirectory is the directory where is located the built code of the plugin.
In this example, pingpongdelay and livegain build scripts produce files in their dist directory.
If your plugin code is at the root, just set the buildDirectory value to the empty string "".

### Writing a plugin

A plugin is composed of three main files :
- `descriptor.json`: a JSON file to describe the plugin
- `index.js`: an ES module that implements the _WebAudioModule_ class from the sdk
- `gui.js`: an ES module that exports a function to create a DOM node containing the plugin GUI

__descriptor.json__
Firstly create a file `descriptor.json`. The descriptor must contain at list the name of the plugin.
Example:
```json
# descriptor.json
{
	"name": "SimpleGain",
	"params": {
		"gain": {
			"defaultValue": 1,
			"maxValue": 1,
			"minValue": 0
		}
	}
}
```
See [descriptor.json](#descriptorjson) in the following for more details.

__index.js__
Then create the WebAudioModule **ES module**.
This module must export as default a class that extends the sdk WebAudioModule class.
The only method that must be implemented is `async createAudioNode(options)`.
Example:
```js
import { WebAudioModule } from 'sdk';

export default class SimpleGainPlugin extends WebAudioModule {
	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	async createAudioNode(options) {
		const gainNode = new GainNode(this.audioContext, options);
		return gainNode;
	}
}
```

__gui.js__
If you want your plugin to export a gui. Create a es module file named gui.js.
The module must export a named export createElement: `async function createElement(plugin)`.

The plugin parameter is the instance of the WebAudioModule that can be used by the GUI for example
to get a reference to the AudioNode etc..

The function must return a `HTMLElement`.

Example using native DOM :
```js
export async function createElement(plugin) {
	const div = document.createElement('div');
	div.textContent = `WebAudioModule[${plugin.name}]`;
	return div;
}
```

Example using React :
This example requires more build configuration in the plugin. The plugin must be passed to babel with jsx transform.
The `livegain` plugin is an example that uses React and TypeScript.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import SimpleGainComponent from './SimpleGainComponent';

export async function createElement(plugin) {
	const div = document.createElement('div');
    ReactDOM.render(<SimpleGainComponent plugin={plugin} />, div);
    return div;
}
```

### Loading a plugin

__loadPluginFromUrl(descriptorUrl)__
Back to the host ! Now that we have a plugin ready, we have to load it in the host.
The sdk offers the function `async loadPluginFromUrl(descriptorUrl)` that will load the plugin
code from the descriptor.json file of the plugin.

Example:
```js
import { Loader } from 'sdk';

const SimpleGainPlugin = await Loader.loadPluginFromUrl('./simplegain/descriptor.json');
```

If you use the host package, the descriptorUrl must be in the following format:
`./<packageName>/descriptor.json`. Replace `<packageName>` with the name of your plugin package.

In other hosts, `descriptorUrl` can be any url (assuming that CORS headers are correctly configured in the server of the plugin).

__WebAudioModule.createInstance()__

Now that your plugin is available, you can create an instance of it using `WebAudioModule.createInstance(audioContext)`.

Example:
```js
const audioContext = new AudioContext();
// The code part relative to the audio source and destination is not covered here.
// If you want a complete example, see the host code in host/src/index.js or host/src/livegain.js
const simpleGainPluginInstance = await SimpleGain.createInstance(audioContext);
simpleGainPluginInstance.setState({ enabled: true }); // plugins audionodes are bypassed by default.
```

__Connect the audionode__
Now that we have an instance of our plugin we can connect its audionode to ours.

Example:
```js
const simpleGainPluginAudioNode = simpleGainPluginInstance.getAudioNode();
mediaElementSource.connect(simpleGainPluginAudioNode);
simpleGainPluginAudioNode.connect(audioContext.destination);
```

__Show the GUI__
We now have to create the HTMLElement that hosts the plugin GUI thanks to the plugin method `async instance.createGui()`.
The methods loads the GUI module if it was not loaded before and then call its exported method `async createElement()`.

_About GUI module lazy loading:_
If you do not want to load the GUI directly when loading a plugin, you can call the `Loader.loadPluginFromUrl` method
with an extra option `{ noGui: true }`.
Example:
```js
const SimpleGainPlugin = await Loader.loadPluginFromUrl('./simplegain/descriptor.json', { noGui: true });
```

If the option noGui is present, then the createGui method will load the plugin GUI module once before.

Now that you have an HTML element, append it to the host DOM.

Example:
```js
// For this very simple example, we just insert the SimpleGain Gui directly at the end of the body
const { body } = document;
const simpleGainPluginGui = simpleGainPluginInstance.createGui();
body.appendChild(domNode);
```

## sdk

### descriptor.json

_if you copy the following, mind to remove comments ;-)_
```js
{
	// Name of the plugin
	"name": "PluginName",
	"params": {
		// A map of every param available in the plugin
		"paramVariableName": {
			"defaultValue": 0.5,
			"minValue": 0,
			"maxValue": 1
		},
	},
	"banks": {
		// A map of every bank available in the plugin
		"bank1": {
			"label": "Bank 1",
			"patches": [
				"patch1"
			]
		}
	},
	"patches" : {
		// A map of every patch available in the plugin
		"patch1": {
			"label": "Patch 1",
			"params": {
				"paramVariableName": 0.6,
			}
		}
	},
	// the relative path to WebAudioModule module (default: index.js)
	"entry": "./index.js",
	// the relative path to WebAudioModule module (default: gui.js)
	"gui": "./Gui/index.js"
}
```

### Loader

### WebAudioModule
