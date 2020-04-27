import * as React from "react";
import * as ReactDOM from "react-dom";
import type LiveGainPlugin from "./LiveGainPlugin";
import LiveGainUI from "./LiveGainUI";

export const createElement = async (plugin: LiveGainPlugin) => {
    const div = document.createElement("div");
    ReactDOM.render(<LiveGainUI plugin={plugin} {...plugin.state} />, div);
    return div;
};
