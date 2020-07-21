/* eslint-disable react/jsx-filename-extension */
import * as React from "react";
import * as ReactDOM from "react-dom";
import type LiveGainModule from "./LiveGainPlugin";
import LiveGainUI from "./LiveGainUI";

export const createElement = async (plugin: LiveGainModule) => {
    const div = document.createElement("div");
    ReactDOM.render(<LiveGainUI module={plugin} />, div);
    return div;
};
