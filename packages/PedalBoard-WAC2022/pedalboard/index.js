import WebAudioModule from "https://mainline.i3s.unice.fr/PedalEditor/Back-End/functional-pedals/published/freeverbForBrowser/utils/sdk/src/WebAudioModule.js";
import ParamMgrFactory from "https://mainline.i3s.unice.fr/PedalEditor/Back-End/functional-pedals/published/freeverbForBrowser/utils/sdk-parammgr/src/ParamMgrFactory.js";
import PedalBoardNode from "./Wam/node.js";
import { createElement } from "./Gui/index.js";

/**
 * @param {URL} relativeURL
 * @returns {string}
 */
const getBasetUrl = (relativeURL) => {
  const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf("/"));
  return baseURL;
};

export default class PedalBoardPlugin extends WebAudioModule {
  _baseURL = getBasetUrl(new URL(".", import.meta.url));

  _descriptorUrl = `${this._baseURL}/descriptor.json`;

  id = 0;

  removeRelativeUrl = (relativeURL) => {
    if (relativeURL[0] == ".") {
      return `${this._baseURL}${relativeURL.substring(1)}`;
    } else {
      return relativeURL;
    }
  };

  async _loadDescriptor() {
    const url = this._descriptorUrl;
    if (!url) throw new TypeError("Descriptor not found");
    const response = await fetch(url);
    const descriptor = await response.json();
    Object.assign(this.descriptor, descriptor);
  }

  async initialize(state) {
    await this._loadDescriptor();
    await this.fetchServers();
    return super.initialize(state);
  }

  /**
   * Initialize the WamNode of the PedalBoard with an initialState if provided.
   * @param {*} initialState
   * @returns The PedalBoardNode.
   * @author Quentin Beauchet
   */
  async createAudioNode(initialState) {
    this.pedalboardNode = new PedalBoardNode(this.audioContext);

    const paramMgrNode = await ParamMgrFactory.create(this, {});
    this.pedalboardNode.setup(paramMgrNode);
    if (initialState) {
      this.pedalboardNode.initialState = initialState;
    } else {
      let file = await fetch(`${this._baseURL}/initialState.json`);
      this.pedalboardNode.initialState = await file.json();
    }

    return this.pedalboardNode;
  }

  /**
   * Fetch the wam from each of the servers in the repositories.json file and then import their WebAudioModule.
   * For each of them store the needed information in this.WAMS.
   * @author Quentin Beauchet
   */
  async fetchServers() {
    const filterFetch = (el) => el.status == "fulfilled" && el.value.status == 200;

    let repos = await fetch(`${this._baseURL}/repositories.json`);
    let json2 = await repos.json();
    let files = await Promise.allSettled(json2.map((el) => fetch(this.removeRelativeUrl(el))));
    let urls = await Promise.all(files.filter(filterFetch).map((el) => el.value.json()));
    urls = urls.reduce((arr, next) => arr.concat(next), []);

    let responses = await Promise.allSettled(urls.map((el) => fetch(`${el}descriptor.json`)));

    let descriptors = await Promise.all(responses.filter(filterFetch).map((el) => el.value.json()));

    let modules = await Promise.allSettled(urls.map((el) => import(`${el}index.js`)));

    this.WAMS = {};
    descriptors.forEach((el, index) => {
      if (modules[index].status == "fulfilled") {
        this.WAMS[el.name] = {
          url: urls[index],
          descriptor: el,
          module: modules[index].value,
        };
      }
    });
  }

  async loadPreset(nodes) {
    let board = this.pedalboardNode.module.gui.board;
    this.pedalboardNode.disconnectNodes(board.childNodes, true);
    board.innerHTML = "";
    for (let el of nodes) {
      await this.addWAM(el.name, el.state);
    }
  }

  /**
   * Add a wam to the board, instanciate the WamNode with an initial state if provided and append the Gui to the board.
   * @param {string} WamName
   * @param {Object} state
   * @author Quentin Beauchet
   */
  async addWAM(WamName, state) {
    const { default: WAM } = this.WAMS[WamName].module;
    let instance = await WAM.createInstance(this.pedalboardNode.module._groupId, this.pedalboardNode.context);
    if (state) {
      instance.audioNode.setState(state);
    }
    this.pedalboardNode.addPlugin(instance.audioNode, WamName, this.id);
    this.gui.addPlugin(instance, this.WAMS[WamName].img, this.id);
    this.id++;
  }

  createGui() {
    return createElement(this);
  }
}
