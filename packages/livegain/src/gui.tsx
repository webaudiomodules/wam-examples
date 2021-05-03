/* eslint-disable react/jsx-filename-extension */
import * as React from "react";
import * as ReactDOM from "react-dom";
import { WebAudioModule } from "sdk";

export const createElement = async (plugin: WebAudioModule, JSX: typeof React.Component) => {
    const div = document.createElement("div");
    ReactDOM.render(<JSX module={plugin} />, div);
    return div;
};

export const destroyElement = (div: Element) => {
    ReactDOM.unmountComponentAtNode(div);
    return div;
};
