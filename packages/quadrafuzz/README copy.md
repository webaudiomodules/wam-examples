# `quadrafuzz`

> This is a pure JS/WebAudio high level node made plugin. It has 4 params that are not intended to be automatable at a-rate or k-rate (they involve recomputing waveshaper curves). So we declared them with a custom rate. See index.js.
> Also, this plugins uses local assets for the background image of its GUI, for the spritesheet images used by the knobs and by the on/off switch. The GUI is a WebComponent, and Webomponent does not allow relative path in the CSS. Look at gui.js and see how we transform relative to absolute paths.
> As this version is meant to be built by rollup, we could use some babel plugins to split up the WebComponent code. The CSS stylesheet and the HTML template are imported in gui.js (this is not possible with regular JavaScript).
> Note that there is another version of this plugin in the repo, that does not require any special environment, and runs without the need to be bundled.
