import React from 'react';

class PluginContainer extends React.PureComponent {
    /** @type {HTMLElement} */
    pluginUI = undefined;
    // root: ShadowRoot;
    container = this.createContainer();
    rootContainer = this.createRootContainer();
    closeButton = this.createCloseButton();
    titleSpan = this.createTitleSpan();
    nameSpan = this.createNameSpan();

    handleClose = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.props.onClose(this.props.index);
    };
    handleNameMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const { left, top, width, height } = this.container.getBoundingClientRect();
        const { innerWidth, innerHeight } = window;
        const origin = { x: e.clientX, y: e.clientY };
        const handleMouseMove = (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.movementX || e.movementY) {
                const { clientX, clientY } = e;
                this.container.style.left = `${Math.max(0, Math.min(innerWidth - width, left + clientX - origin.x))}px`;
                this.container.style.top = `${Math.max(0, Math.min(innerHeight - height, top + clientY - origin.y))}px`;
            }
        };
        const handleMouseUp = () => {
            e.stopPropagation();
            e.preventDefault();
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };
    createContainer() {
        const div = document.createElement("div");
        div.className = "plugin-container";
        return div;
    }
    createRootContainer() {
        const div = document.createElement("div");
        div.className = "plugin-container-root";
        return div;
    }
    createTitleSpan() {
        const span = document.createElement("span");
        span.className = "plugin-container-title";
        return span;
    }
    createNameSpan() {
        const span = document.createElement("span");
        span.className = "plugin-container-name";
        span.innerText = this.props.name;
        return span;
    }
    createCloseButton() {
        const button = document.createElement("button");
        button.innerText = '×'
        return button;
    }
    async componentDidMount() {
        this.titleSpan.appendChild(this.nameSpan);
        this.titleSpan.appendChild(this.closeButton);
        this.container.appendChild(this.titleSpan);
        this.container.appendChild(this.rootContainer);
        document.body.appendChild(this.container);
        this.closeButton.addEventListener("click", this.handleClose);
        this.nameSpan.addEventListener("mousedown", this.handleNameMouseDown);
        // const root = this.rootContainer.attachShadow({ mode: "open" });
        // this.root = root;
        if (this.props.hidden) this.container.classList.add("hidden");
        this.pluginUI = await this.props.plugin.createGui();
        this.rootContainer.innerHTML = "";
        this.rootContainer.appendChild(this.pluginUI);
    }
    componentWillUnmount() {
        this.closeButton.removeEventListener("click", this.handleClose);
        this.nameSpan.removeEventListener("mousedown", this.handleNameMouseDown);
        document.body.removeChild(this.container);
        this.props.onClose(this.props.index);
        if (this.pluginUI) this.props.plugin.destroyGui(this.pluginUI);
    }
    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.hidden !== prevProps.hidden) {
            if (this.props.hidden) this.container.classList.add("hidden");
            else this.container.classList.remove("hidden");
        }
        if (this.props.name !== prevProps.name) {
            this.nameSpan.innerText = this.props.name;
        }
        if (!this.rootContainer) return;
        if (this.props.plugin !== prevProps.plugin) {
            if (this.pluginUI) prevProps.plugin.destroyGui(this.pluginUI);
            this.pluginUI = await this.props.plugin.createGui();
            this.rootContainer.innerHTML = "";
            this.rootContainer.appendChild(this.pluginUI);
        }
    }
    render() {
        return <></>;
    }
}

export default PluginContainer;
