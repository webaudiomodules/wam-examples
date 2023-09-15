import React from 'react';
import PluginContainer from './PluginContainer.jsx';
import { VERSION as apiVersion } from '@webaudiomodules/api';
import { initializeWamEnv, initializeWamGroup, addFunctionModule } from '@webaudiomodules/sdk';
import mp3Url from '../../faustPingPongDelay/host/CleanGuitarRiff.mp3';
import './App.css';

class App extends React.PureComponent {
  /** @type {{ plugin: import("../../api/src/types").WebAudioModule} } */
  state = { plugin: null };
  player = React.createRef();
  once = false;
  handlePlay = () => {
    this.audioContext.resume(); // audio context must be resumed because browser restrictions
  };
  async componentDidMount() {
    if (this.once) return;
    this.once = true;
    // Safari...
    const AudioContext = window.AudioContext // Default
      || window.webkitAudioContext // Safari and old versions of Chrome
      || false;
    
    const audioContext = new AudioContext();
    this.audioContext = audioContext;
    const mediaElementSource = audioContext.createMediaElementSource(this.player.current);
    
    // Init WamEnv
    // const { default: apiVersion } = await import("../../api/src/version.js");
    // const { default: addFunctionModule } = await import("../../sdk/src/addFunctionModule.js");
    // const { default: initializeWamEnv } = await import("../../sdk/src/WamEnv.js");
    await addFunctionModule(audioContext.audioWorklet, initializeWamEnv, apiVersion);
    // const { default: initializeWamGroup } = await import("../../sdk/src/WamGroup.js");
    const hostGroupId = 'test-host';
    const hostGroupKey = performance.now().toString();
    await addFunctionModule(audioContext.audioWorklet, initializeWamGroup, hostGroupId, hostGroupKey);
  
    const pluginUrl = 'https://www.webaudiomodules.com/community/plugins/wimmics/OwlDirty/index.js';
    // Import WAM
    const { default: WAM } = await import(pluginUrl);
    // Create a new instance of the plugin
    // You can can optionnally give more options such as the initial state of the plugin
    const instance = await WAM.createInstance(hostGroupId, audioContext);
  
    window.instance = instance;

    mediaElementSource.connect(instance.audioNode);
    instance.audioNode.connect(audioContext.destination);

    this.setState({ plugin: instance });
  }
  render() {
    return (
      <>
        <audio id="player" src={mp3Url} controls loop crossOrigin="anonymous" onPlay={this.handlePlay} ref={this.player}></audio>
        <div id="mount">
          {
            this.state.plugin ? <PluginContainer index={0} name={'Name'} plugin={this.state.plugin} hidden={false} onClose={(index) => {}} /> : null
          }
        </div>
      </>
    )
  }
}

export default App;
