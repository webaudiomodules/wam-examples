# Pedalboard

**About the project**
---
In this project we have written an audio multi-effects application based on WebAudio Modules 2.0 plugins.
The objective of this project is to realize a pedalboard which contains several wam.

**⚠️WARNING⚠️**
---
Every plugin from Faust IDE use WebAssembly for it's AudioProcessor and this cause the issue of a memory limit pretty quickly, it is pretty well explained on [this blog](https://blog.stackblitz.com/posts/debugging-v8-webassembly/), this result in the fact that after 100 Faust plugins we can't add another one even if we have removed it from the JavaScript memory because WebAssembly has no garbage collector.  
Because the issues come from Faust IDE we can't, and we won't try to resolve it, all we did was to make sure the PedalBoard won't crash from it and to disable the addition of Faust plugins inside it after a certain threshold. If you want to use the Pedalboard after the memory is full you'll need to reload the page.

**Getting started**
---
  * You can play with the [version](https://wam-bank.herokuapp.com) that is hosted online.
  * Or if you want to import it on your page you have to use https://wam-bank.herokuapp.com/pedalboard/index.js and follow [the instructions from the sdk.](https://github.com/webaudiomodules/wam-examples#loading-a-plugin)

**Usage**
---
  * First for the menu on the top of the pedalboard you can choose the type of the wam that you want
  * The preview it's just bellow the menu. In the preview you can see all the plugins you want and if you click on a plugin it's add to the board.
  * For the board, you can see differents things : 
      * When you have differents plugins you can drag and drop them.
      * If you want to delete a plugin you have to click on the cross on the top-left
      * You have the name of the plugin on the right of the cross
  * In the menu on the bottom of the pedalboard you have tree categories : 
      1. The Banks : 
       it's the list of all the categories of music. 
         - You can add a new bank if you click on "New Bank".
         - You can rename a bank if you click on the button : <img src="https://michael-marynowicz.github.io/TER/pedalboard/Gui/assets/editButton.svg" width="15" height="15">
         - You can delete a bank (if it's empty) if you click on the button : <img src="https://michael-marynowicz.github.io/TER/pedalboard/Gui/assets/deleteButton.svg" width="15" height="15">
         - And if you click on a bank it's list all the presets of the bank in the categorie "Presets"
      2. The Presets :
       it's the list of all the presets for a bank. 
         - For the presets it’s the same as for the banks if you click on <img src="https://michael-marynowicz.github.io/TER/pedalboard/Gui/assets/editButton.svg" width="15" height="15"> you can modify the name of the preset and if you click on 
          <img src="https://michael-marynowicz.github.io/TER/pedalboard/Gui/assets/deleteButton.svg" width="15" height="15"> you can delete the preset.
         - If you click on the preset it's load on the board all the plugins saves in the presets ( in the same order and with the same configuration of the buttons).
      3. Informations : 
       information of a preset 
         - In this part you can have all informations about a preset, it's means : the banks and the preset to which it is attached   
          
**References**
---
 * [The Web Audio Module API](https://github.com/webaudiomodules)
      * [The sdk used to create the PedalBoard](https://github.com/webaudiomodules/sdk)
      * [The sdk-parammgr the we used for the PedalBoard without the audioThread](https://github.com/webaudiomodules/sdk-parammgr)
      * [An example of a host that we used to learn how to build a WAM2 plugin](https://mainline.i3s.unice.fr/wam2/packages/_/) with its [source code](https://github.com/webaudiomodules/wam-examples) and those from multiple plugins avalable on github
 * [The faust IDE that we uses to create plugins from DSP code](https://faustide.grame.fr/)
 * [The server were we host the PedalBoard and its plugins](https://wam-bank.herokuapp.com/) and the [source code](https://github.com/QuentinBeauchet/plugins_server_webaudiomodules) for the plugins
 * [The paper](https://zenodo.org/record/6769098) about our work we submitted for the [WAC2022](https://wac2022.i3s.univ-cotedazur.fr/)
      



