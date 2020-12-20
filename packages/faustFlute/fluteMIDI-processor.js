
/*
Code generated with Faust version 2.28.8
Compilation options: -lang wasm-eb -scal -ftz 2
*/

function getJSONfluteMIDI() {
	return '{"name": "fluteMIDI","filename": "fluteMIDI.dsp","version": "2.28.8","compile_options": "-lang wasm-eb -scal -ftz 2","library_list": ["/usr/local/share/faust/stdfaust.lib","/usr/local/share/faust/physmodels.lib","/usr/local/share/faust/basics.lib","/usr/local/share/faust/maths.lib","/usr/local/share/faust/platform.lib","/usr/local/share/faust/signals.lib","/usr/local/share/faust/noises.lib","/usr/local/share/faust/filters.lib","/usr/local/share/faust/oscillators.lib","/usr/local/share/faust/routes.lib","/usr/local/share/faust/delays.lib"],"include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/34C959DCA4F7153B52818FC9883ED48E4F65B1A5/web/webaudiowasm-worklet-poly"],"size": 295152,"inputs": 0,"outputs": 2,"meta": [ { "basics.lib/name": "Faust Basic Element Library" },{ "basics.lib/version": "0.1" },{ "copyright": "(c)Romain Michon, CCRMA (Stanford University), GRAME" },{ "delays.lib/name": "Faust Delay Library" },{ "delays.lib/version": "0.1" },{ "description": "Simple MIDI-controllable flute physical model with physical parameters." },{ "filename": "fluteMIDI.dsp" },{ "filters.lib/dcblocker:author": "Julius O. Smith III" },{ "filters.lib/dcblocker:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/dcblocker:license": "MIT-style STK-4.3 license" },{ "filters.lib/fir:author": "Julius O. Smith III" },{ "filters.lib/fir:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/fir:license": "MIT-style STK-4.3 license" },{ "filters.lib/iir:author": "Julius O. Smith III" },{ "filters.lib/iir:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/iir:license": "MIT-style STK-4.3 license" },{ "filters.lib/lowpass0_highpass1": "MIT-style STK-4.3 license" },{ "filters.lib/lowpass0_highpass1:author": "Julius O. Smith III" },{ "filters.lib/lowpass:author": "Julius O. Smith III" },{ "filters.lib/lowpass:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/lowpass:license": "MIT-style STK-4.3 license" },{ "filters.lib/name": "Faust Filters Library" },{ "filters.lib/pole:author": "Julius O. Smith III" },{ "filters.lib/pole:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/pole:license": "MIT-style STK-4.3 license" },{ "filters.lib/tf2:author": "Julius O. Smith III" },{ "filters.lib/tf2:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/tf2:license": "MIT-style STK-4.3 license" },{ "filters.lib/tf2s:author": "Julius O. Smith III" },{ "filters.lib/tf2s:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/tf2s:license": "MIT-style STK-4.3 license" },{ "filters.lib/version": "0.2" },{ "filters.lib/zero:author": "Julius O. Smith III" },{ "filters.lib/zero:copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters.lib/zero:license": "MIT-style STK-4.3 license" },{ "license": "MIT" },{ "maths.lib/author": "GRAME" },{ "maths.lib/copyright": "GRAME" },{ "maths.lib/license": "LGPL with exception" },{ "maths.lib/name": "Faust Math Library" },{ "maths.lib/version": "2.3" },{ "name": "fluteMIDI" },{ "noises.lib/name": "Faust Noise Generator Library" },{ "noises.lib/version": "0.0" },{ "oscillators.lib/name": "Faust Oscillator Library" },{ "oscillators.lib/version": "0.1" },{ "platform.lib/name": "Generic Platform Library" },{ "platform.lib/version": "0.1" },{ "routes.lib/name": "Faust Signal Routing Library" },{ "routes.lib/version": "0.2" },{ "signals.lib/name": "Faust Signal Routing Library" },{ "signals.lib/version": "0.0" }],"ui": [ {"type": "vgroup","label": "flute","items": [ {"type": "hgroup","label": "midi","meta": [{ "0": "" }],"items": [ {"type": "hslider","label": "freq","address": "/flute/midi/freq","index": 270484,"meta": [{ "0": "" },{ "style": "knob" }],"init": 440,"min": 50,"max": 1000,"step": 0.01},{"type": "hslider","label": "bend","address": "/flute/midi/bend","index": 270488,"meta": [{ "1": "" },{ "hidden": "1" },{ "midi": "pitchwheel" },{ "style": "knob" }],"init": 0,"min": -2,"max": 2,"step": 0.01},{"type": "hslider","label": "gain","address": "/flute/midi/gain","index": 262196,"meta": [{ "2": "" },{ "style": "knob" }],"init": 0.9,"min": 0,"max": 1,"step": 0.01},{"type": "hslider","label": "envAttack","address": "/flute/midi/envAttack","index": 262192,"meta": [{ "3": "" },{ "style": "knob" }],"init": 1,"min": 0,"max": 30,"step": 0.01},{"type": "hslider","label": "sustain","address": "/flute/midi/sustain","index": 262200,"meta": [{ "4": "" },{ "hidden": "1" },{ "midi": "ctrl 64" },{ "style": "knob" }],"init": 0,"min": 0,"max": 1,"step": 1}]},{"type": "hgroup","label": "otherParams","meta": [{ "1": "" }],"items": [ {"type": "hslider","label": "mouthPosition","address": "/flute/otherParams/mouthPosition","index": 270500,"meta": [{ "0": "" },{ "midi": "ctrl 1" },{ "style": "knob" }],"init": 0.5,"min": 0,"max": 1,"step": 0.01},{"type": "hslider","label": "vibratoFreq","address": "/flute/otherParams/vibratoFreq","index": 262180,"meta": [{ "1": "" },{ "style": "knob" }],"init": 5,"min": 1,"max": 10,"step": 0.01},{"type": "hslider","label": "vibratoGain","address": "/flute/otherParams/vibratoGain","index": 262164,"meta": [{ "2": "" },{ "style": "knob" }],"init": 0.5,"min": 0,"max": 1,"step": 0.01},{"type": "hslider","label": "outGain","address": "/flute/otherParams/outGain","index": 262144,"meta": [{ "3": "" },{ "style": "knob" }],"init": 0.5,"min": 0,"max": 1,"step": 0.01}]},{"type": "button","label": "gate","address": "/flute/gate","index": 262204,"meta": [{ "2": "" }]}]}]}';
}
function getBase64CodefluteMIDI() { return "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AAsLta2AgAABAEEAC64teyJuYW1lIjogImZsdXRlTUlESSIsImZpbGVuYW1lIjogImZsdXRlTUlESS5kc3AiLCJ2ZXJzaW9uIjogIjIuMjguOCIsImNvbXBpbGVfb3B0aW9ucyI6ICItbGFuZyB3YXNtLWViIC1zY2FsIC1mdHogMiIsImxpYnJhcnlfbGlzdCI6IFsiL3Vzci9sb2NhbC9zaGFyZS9mYXVzdC9zdGRmYXVzdC5saWIiLCIvdXNyL2xvY2FsL3NoYXJlL2ZhdXN0L3BoeXNtb2RlbHMubGliIiwiL3Vzci9sb2NhbC9zaGFyZS9mYXVzdC9iYXNpY3MubGliIiwiL3Vzci9sb2NhbC9zaGFyZS9mYXVzdC9tYXRocy5saWIiLCIvdXNyL2xvY2FsL3NoYXJlL2ZhdXN0L3BsYXRmb3JtLmxpYiIsIi91c3IvbG9jYWwvc2hhcmUvZmF1c3Qvc2lnbmFscy5saWIiLCIvdXNyL2xvY2FsL3NoYXJlL2ZhdXN0L25vaXNlcy5saWIiLCIvdXNyL2xvY2FsL3NoYXJlL2ZhdXN0L2ZpbHRlcnMubGliIiwiL3Vzci9sb2NhbC9zaGFyZS9mYXVzdC9vc2NpbGxhdG9ycy5saWIiLCIvdXNyL2xvY2FsL3NoYXJlL2ZhdXN0L3JvdXRlcy5saWIiLCIvdXNyL2xvY2FsL3NoYXJlL2ZhdXN0L2RlbGF5cy5saWIiXSwiaW5jbHVkZV9wYXRobmFtZXMiOiBbIi91c3IvbG9jYWwvc2hhcmUvZmF1c3QiLCIvdXNyL2xvY2FsL3NoYXJlL2ZhdXN0IiwiL3Vzci9zaGFyZS9mYXVzdCIsIi4iLCIvdG1wL3Nlc3Npb25zLzM0Qzk1OURDQTRGNzE1M0I1MjgxOEZDOTg4M0VENDhFNEY2NUIxQTUvd2ViL3dlYmF1ZGlvd2FzbS13b3JrbGV0LXBvbHkiXSwic2l6ZSI6IDI5NTE1MiwiaW5wdXRzIjogMCwib3V0cHV0cyI6IDIsIm1ldGEiOiBbIHsgImJhc2ljcy5saWIvbmFtZSI6ICJGYXVzdCBCYXNpYyBFbGVtZW50IExpYnJhcnkiIH0seyAiYmFzaWNzLmxpYi92ZXJzaW9uIjogIjAuMSIgfSx7ICJjb3B5cmlnaHQiOiAiKGMpUm9tYWluIE1pY2hvbiwgQ0NSTUEgKFN0YW5mb3JkIFVuaXZlcnNpdHkpLCBHUkFNRSIgfSx7ICJkZWxheXMubGliL25hbWUiOiAiRmF1c3QgRGVsYXkgTGlicmFyeSIgfSx7ICJkZWxheXMubGliL3ZlcnNpb24iOiAiMC4xIiB9LHsgImRlc2NyaXB0aW9uIjogIlNpbXBsZSBNSURJLWNvbnRyb2xsYWJsZSBmbHV0ZSBwaHlzaWNhbCBtb2RlbCB3aXRoIHBoeXNpY2FsIHBhcmFtZXRlcnMuIiB9LHsgImZpbGVuYW1lIjogImZsdXRlTUlESS5kc3AiIH0seyAiZmlsdGVycy5saWIvZGNibG9ja2VyOmF1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnMubGliL2RjYmxvY2tlcjpjb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVycy5saWIvZGNibG9ja2VyOmxpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzLmxpYi9maXI6YXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVycy5saWIvZmlyOmNvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzLmxpYi9maXI6bGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnMubGliL2lpcjphdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzLmxpYi9paXI6Y29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnMubGliL2lpcjpsaWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVycy5saWIvbG93cGFzczBfaGlnaHBhc3MxIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVycy5saWIvbG93cGFzczBfaGlnaHBhc3MxOmF1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnMubGliL2xvd3Bhc3M6YXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVycy5saWIvbG93cGFzczpjb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVycy5saWIvbG93cGFzczpsaWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVycy5saWIvbmFtZSI6ICJGYXVzdCBGaWx0ZXJzIExpYnJhcnkiIH0seyAiZmlsdGVycy5saWIvcG9sZTphdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzLmxpYi9wb2xlOmNvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzLmxpYi9wb2xlOmxpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzLmxpYi90ZjI6YXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVycy5saWIvdGYyOmNvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzLmxpYi90ZjI6bGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnMubGliL3RmMnM6YXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVycy5saWIvdGYyczpjb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVycy5saWIvdGYyczpsaWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVycy5saWIvdmVyc2lvbiI6ICIwLjIiIH0seyAiZmlsdGVycy5saWIvemVybzphdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzLmxpYi96ZXJvOmNvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzLmxpYi96ZXJvOmxpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJsaWNlbnNlIjogIk1JVCIgfSx7ICJtYXRocy5saWIvYXV0aG9yIjogIkdSQU1FIiB9LHsgIm1hdGhzLmxpYi9jb3B5cmlnaHQiOiAiR1JBTUUiIH0seyAibWF0aHMubGliL2xpY2Vuc2UiOiAiTEdQTCB3aXRoIGV4Y2VwdGlvbiIgfSx7ICJtYXRocy5saWIvbmFtZSI6ICJGYXVzdCBNYXRoIExpYnJhcnkiIH0seyAibWF0aHMubGliL3ZlcnNpb24iOiAiMi4zIiB9LHsgIm5hbWUiOiAiZmx1dGVNSURJIiB9LHsgIm5vaXNlcy5saWIvbmFtZSI6ICJGYXVzdCBOb2lzZSBHZW5lcmF0b3IgTGlicmFyeSIgfSx7ICJub2lzZXMubGliL3ZlcnNpb24iOiAiMC4wIiB9LHsgIm9zY2lsbGF0b3JzLmxpYi9uYW1lIjogIkZhdXN0IE9zY2lsbGF0b3IgTGlicmFyeSIgfSx7ICJvc2NpbGxhdG9ycy5saWIvdmVyc2lvbiI6ICIwLjEiIH0seyAicGxhdGZvcm0ubGliL25hbWUiOiAiR2VuZXJpYyBQbGF0Zm9ybSBMaWJyYXJ5IiB9LHsgInBsYXRmb3JtLmxpYi92ZXJzaW9uIjogIjAuMSIgfSx7ICJyb3V0ZXMubGliL25hbWUiOiAiRmF1c3QgU2lnbmFsIFJvdXRpbmcgTGlicmFyeSIgfSx7ICJyb3V0ZXMubGliL3ZlcnNpb24iOiAiMC4yIiB9LHsgInNpZ25hbHMubGliL25hbWUiOiAiRmF1c3QgU2lnbmFsIFJvdXRpbmcgTGlicmFyeSIgfSx7ICJzaWduYWxzLmxpYi92ZXJzaW9uIjogIjAuMCIgfV0sInVpIjogWyB7InR5cGUiOiAidmdyb3VwIiwibGFiZWwiOiAiZmx1dGUiLCJpdGVtcyI6IFsgeyJ0eXBlIjogImhncm91cCIsImxhYmVsIjogIm1pZGkiLCJtZXRhIjogW3sgIjAiOiAiIiB9XSwiaXRlbXMiOiBbIHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiZnJlcSIsImFkZHJlc3MiOiAiL2ZsdXRlL21pZGkvZnJlcSIsImluZGV4IjogMjcwNDg0LCJtZXRhIjogW3sgIjAiOiAiIiB9LHsgInN0eWxlIjogImtub2IiIH1dLCJpbml0IjogNDQwLCJtaW4iOiA1MCwibWF4IjogMTAwMCwic3RlcCI6IDAuMDF9LHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiYmVuZCIsImFkZHJlc3MiOiAiL2ZsdXRlL21pZGkvYmVuZCIsImluZGV4IjogMjcwNDg4LCJtZXRhIjogW3sgIjEiOiAiIiB9LHsgImhpZGRlbiI6ICIxIiB9LHsgIm1pZGkiOiAicGl0Y2h3aGVlbCIgfSx7ICJzdHlsZSI6ICJrbm9iIiB9XSwiaW5pdCI6IDAsIm1pbiI6IC0yLCJtYXgiOiAyLCJzdGVwIjogMC4wMX0seyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJnYWluIiwiYWRkcmVzcyI6ICIvZmx1dGUvbWlkaS9nYWluIiwiaW5kZXgiOiAyNjIxOTYsIm1ldGEiOiBbeyAiMiI6ICIiIH0seyAic3R5bGUiOiAia25vYiIgfV0sImluaXQiOiAwLjksIm1pbiI6IDAsIm1heCI6IDEsInN0ZXAiOiAwLjAxfSx7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogImVudkF0dGFjayIsImFkZHJlc3MiOiAiL2ZsdXRlL21pZGkvZW52QXR0YWNrIiwiaW5kZXgiOiAyNjIxOTIsIm1ldGEiOiBbeyAiMyI6ICIiIH0seyAic3R5bGUiOiAia25vYiIgfV0sImluaXQiOiAxLCJtaW4iOiAwLCJtYXgiOiAzMCwic3RlcCI6IDAuMDF9LHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAic3VzdGFpbiIsImFkZHJlc3MiOiAiL2ZsdXRlL21pZGkvc3VzdGFpbiIsImluZGV4IjogMjYyMjAwLCJtZXRhIjogW3sgIjQiOiAiIiB9LHsgImhpZGRlbiI6ICIxIiB9LHsgIm1pZGkiOiAiY3RybCA2NCIgfSx7ICJzdHlsZSI6ICJrbm9iIiB9XSwiaW5pdCI6IDAsIm1pbiI6IDAsIm1heCI6IDEsInN0ZXAiOiAxfV19LHsidHlwZSI6ICJoZ3JvdXAiLCJsYWJlbCI6ICJvdGhlclBhcmFtcyIsIm1ldGEiOiBbeyAiMSI6ICIiIH1dLCJpdGVtcyI6IFsgeyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJtb3V0aFBvc2l0aW9uIiwiYWRkcmVzcyI6ICIvZmx1dGUvb3RoZXJQYXJhbXMvbW91dGhQb3NpdGlvbiIsImluZGV4IjogMjcwNTAwLCJtZXRhIjogW3sgIjAiOiAiIiB9LHsgIm1pZGkiOiAiY3RybCAxIiB9LHsgInN0eWxlIjogImtub2IiIH1dLCJpbml0IjogMC41LCJtaW4iOiAwLCJtYXgiOiAxLCJzdGVwIjogMC4wMX0seyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJ2aWJyYXRvRnJlcSIsImFkZHJlc3MiOiAiL2ZsdXRlL290aGVyUGFyYW1zL3ZpYnJhdG9GcmVxIiwiaW5kZXgiOiAyNjIxODAsIm1ldGEiOiBbeyAiMSI6ICIiIH0seyAic3R5bGUiOiAia25vYiIgfV0sImluaXQiOiA1LCJtaW4iOiAxLCJtYXgiOiAxMCwic3RlcCI6IDAuMDF9LHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAidmlicmF0b0dhaW4iLCJhZGRyZXNzIjogIi9mbHV0ZS9vdGhlclBhcmFtcy92aWJyYXRvR2FpbiIsImluZGV4IjogMjYyMTY0LCJtZXRhIjogW3sgIjIiOiAiIiB9LHsgInN0eWxlIjogImtub2IiIH1dLCJpbml0IjogMC41LCJtaW4iOiAwLCJtYXgiOiAxLCJzdGVwIjogMC4wMX0seyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJvdXRHYWluIiwiYWRkcmVzcyI6ICIvZmx1dGUvb3RoZXJQYXJhbXMvb3V0R2FpbiIsImluZGV4IjogMjYyMTQ0LCJtZXRhIjogW3sgIjMiOiAiIiB9LHsgInN0eWxlIjogImtub2IiIH1dLCJpbml0IjogMC41LCJtaW4iOiAwLCJtYXgiOiAxLCJzdGVwIjogMC4wMX1dfSx7InR5cGUiOiAiYnV0dG9uIiwibGFiZWwiOiAiZ2F0ZSIsImFkZHJlc3MiOiAiL2ZsdXRlL2dhdGUiLCJpbmRleCI6IDI2MjIwNCwibWV0YSI6IFt7ICIyIjogIiIgfV19XX1dfQ=="; }

/*
 faust2wasm: GRAME 2017-2019
*/
 
'use strict';

function getBase64Mixer() { return "AGFzbQEAAAABj4CAgAACYAN/f38AYAR/f39/AX0CkoCAgAABBm1lbW9yeQZtZW1vcnkCAAIDg4CAgAACAAEHmoCAgAACC2NsZWFyT3V0cHV0AAAIbWl4Vm9pY2UAAQqKgoCAAALigICAAAEDfwJAQQAhBQNAAkAgAiAFQQJ0aigCACEDQQAhBANAAkAgAyAEQQJ0akMAAAAAOAIAIARBAWohBCAEIABIBEAMAgUMAQsACwsgBUEBaiEFIAUgAUgEQAwCBQwBCwALCwsLnYGAgAACBH8DfQJ9QQAhB0MAAAAAIQgDQAJAQQAhBiACIAdBAnRqKAIAIQQgAyAHQQJ0aigCACEFA0ACQCAEIAZBAnRqKgIAIQkgCCAJi5chCCAFIAZBAnRqKgIAIQogBSAGQQJ0aiAKIAmSOAIAIAZBAWohBiAGIABIBEAMAgUMAQsACwsgB0EBaiEHIAcgAUgEQAwCBQwBCwALCyAIDwsL"; }

// Polyphonic Faust DSP
class fluteMIDIPolyProcessor extends AudioWorkletProcessor {
    
    // JSON parsing functions
    static parse_ui(ui, obj, callback)
    {
        for (var i = 0; i < ui.length; i++) {
           	fluteMIDIPolyProcessor.parse_group(ui[i], obj, callback);
        }
    }
    
    static parse_group(group, obj, callback)
    {
        if (group.items) {
            fluteMIDIPolyProcessor.parse_items(group.items, obj, callback);
        }
    }
    
    static parse_items(items, obj, callback)
    {
        for (var i = 0; i < items.length; i++) {
            callback(items[i], obj, callback);
        }
    }
    
    static parse_item1(item, obj, callback)
    {
        if (item.type === "vgroup"
            || item.type === "hgroup"
            || item.type === "tgroup") {
            fluteMIDIPolyProcessor.parse_items(item.items, obj, callback);
        } else if (item.type === "hbargraph"
                   || item.type === "vbargraph") {
            // Nothing
        } else if (item.type === "vslider"
                   || item.type === "hslider"
                   || item.type === "button"
                   || item.type === "checkbox"
                   || item.type === "nentry") {
            obj.push({ name: item.address,
                     defaultValue: item.init,
                     minValue: item.min,
                     maxValue: item.max });
        }
    }
    
    static parse_item2(item, obj, callback)
    {
        if (item.type === "vgroup"
            || item.type === "hgroup"
            || item.type === "tgroup") {
            fluteMIDIPolyProcessor.parse_items(item.items, obj, callback);
        } else if (item.type === "hbargraph"
                   || item.type === "vbargraph") {
            // Keep bargraph adresses
            obj.outputs_items.push(item.address);
            obj.pathTable[item.address] = parseInt(item.index);
        } else if (item.type === "vslider"
                   || item.type === "hslider"
                   || item.type === "button"
                   || item.type === "checkbox"
                   || item.type === "nentry") {
            // Keep inputs adresses
            obj.inputs_items.push(item.address);
            obj.pathTable[item.address] = parseInt(item.index);
            if (item.meta !== undefined) {
                for (var i = 0; i < item.meta.length; i++) {
                    if (item.meta[i].midi !== undefined) {
                        if (item.meta[i].midi.trim() === "pitchwheel") {
                            obj.fPitchwheelLabel.push({ path:item.address,
                                  min:parseFloat(item.min),
                                  max:parseFloat(item.max) });
                        } else if (item.meta[i].midi.trim().split(" ")[0] === "ctrl") {
                            obj.fCtrlLabel[parseInt(item.meta[i].midi.trim().split(" ")[1])]
                            .push({ path:item.address,
                                  min:parseFloat(item.min),
                                  max:parseFloat(item.max) });
                        }
                    }
                }
            }
        }
    }
    
    static b64ToUint6(nChr)
    {
        return nChr > 64 && nChr < 91 ?
        nChr - 65
        : nChr > 96 && nChr < 123 ?
        nChr - 71
        : nChr > 47 && nChr < 58 ?
        nChr + 4
        : nChr === 43 ?
        62
        : nChr === 47 ?
        63
        :
        0;
    }
    
    static atob(sBase64, nBlocksSize)
    {
        if (typeof atob === 'function') {
            return atob(sBase64);
        } else {
            
            var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, "");
            var nInLen = sB64Enc.length;
            var nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2;
            var taBytes = new Uint8Array(nOutLen);
            
            for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
                nMod4 = nInIdx & 3;
                nUint24 |= fluteMIDIPolyProcessor.b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
                if (nMod4 === 3 || nInLen - nInIdx === 1) {
                    for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
                    }
                    nUint24 = 0;
                }
            }
            return taBytes.buffer;
        }
    }
    
    static remap(v, mn0, mx0, mn1, mx1)
    {
        return (1.0 * (v - mn0) / (mx0 - mn0)) * (mx1 - mn1) + mn1;
    }

    static get parameterDescriptors() 
    {
        // Analyse JSON to generate AudioParam parameters
        var params = [];
        
        // Add instrument parameters
        fluteMIDIPolyProcessor.parse_ui(JSON.parse(getJSONfluteMIDI()).ui, params, fluteMIDIPolyProcessor.parse_item1);
        
        // Possibly add effect parameters
        if (typeof (getJSONeffect) !== "undefined") {
             fluteMIDIPolyProcessor.parse_ui(JSON.parse(getJSONeffect()).ui, params, fluteMIDIPolyProcessor.parse_item1);
        }
        return params;
    }
    
    static createMemory(buffer_size, polyphony) 
    {
        // Memory allocator
        var ptr_size = 4;
        var sample_size = 4;
        
        function pow2limit(x)
        {
            var n = 65536; // Minimum = 64 kB
            while (n < x) { n = 2 * n; }
            return n;
        }
        
        var json_object = null;
        try {
            json_object = JSON.parse(getJSONfluteMIDI());
        } catch (e) {
            return null;
        }
        
        var effect_json_object_size = 0;
        if (typeof (getJSONeffect) !== "undefined") {
            var effect_json_object = null;
            try {
                effect_json_object = JSON.parse(getJSONeffect());
                effect_json_object_size = parseInt(effect_json_object.size);
            } catch (e) {
                faust.error_msg = "Error in JSON.parse: " + e;
                return null;
            }
        }
        
        var memory_size = pow2limit(effect_json_object_size + parseInt(json_object.size) * polyphony + ((parseInt(json_object.inputs) + parseInt(json_object.outputs) * 2) * (ptr_size + (buffer_size * sample_size)))) / 65536;
        memory_size = Math.max(2, memory_size); // As least 2
        return new WebAssembly.Memory({ initial: memory_size, maximum: memory_size });
    }
    
    constructor(options)
    {
        super(options);
        this.running = true;
        
        this.json_object = JSON.parse(getJSONfluteMIDI());
        if (typeof (getJSONeffect) !== "undefined") {
            this.effect_json_object = JSON.parse(getJSONeffect());
        }
        
        this.output_handler = function(path, value) { this.port.postMessage({ path: path, value: value }); };
        
        this.debug = false;
        
        this.ins = null;
        this.outs = null;
        this.mixing = null;
        this.compute_handler = null;
        
        this.dspInChannnels = [];
        this.dspOutChannnels = [];
        
        this.fFreqLabel = [];
        this.fGateLabel = [];
        this.fGainLabel = [];
        this.fKeyFun = null;
        this.fVelFun = null;
        this.fDate = 0;
        
        this.fPitchwheelLabel = [];
        this.fCtrlLabel = new Array(128);
        for (var i = 0; i < this.fCtrlLabel.length; i++) { this.fCtrlLabel[i] = []; }
   
        this.numIn = parseInt(this.json_object.inputs);
        this.numOut = parseInt(this.json_object.outputs);
        
        // Memory allocator
        this.ptr_size = 4;
        this.sample_size = 4;
         
        var wasm_memory = fluteMIDIPolyProcessor.createMemory(fluteMIDIPolyProcessor.buffer_size, options.processorOptions.polyphony);

        // Create Mixer
        this.mixerObject = { imports: { print: arg => console.log(arg) } }
        this.mixerObject["memory"] = { "memory": wasm_memory };

        this.importObject = {
            env: {
                memoryBase: 0,
                tableBase: 0,
                    
                // Integer version
                _abs: Math.abs,
                
                // Float version
                _acosf: Math.acos,
                _asinf: Math.asin,
                _atanf: Math.atan,
                _atan2f: Math.atan2,
                _ceilf: Math.ceil,
                _cosf: Math.cos,
                _expf: Math.exp,
                _floorf: Math.floor,
                _fmodf: function(x, y) { return x % y; },
                _logf: Math.log,
                _log10f: Math.log10,
                _max_f: Math.max,
                _min_f: Math.min,
                _remainderf: function(x, y) { return x - Math.round(x/y) * y; },
                _powf: Math.pow,
                _roundf: Math.fround,
                _sinf: Math.sin,
                _sqrtf: Math.sqrt,
                _tanf: Math.tan,
                _acoshf: Math.acosh,
                _asinhf: Math.asinh,
                _atanhf: Math.atanh,
                _coshf: Math.cosh,
                _sinhf: Math.sinh,
                _tanhf: Math.tanh,
                   
                // Double version
                _acos: Math.acos,
                _asin: Math.asin,
                _atan: Math.atan,
                _atan2: Math.atan2,
                _ceil: Math.ceil,
                _cos: Math.cos,
                _exp: Math.exp,
                _floor: Math.floor,
                _fmod: function(x, y) { return x % y; },
                _log: Math.log,
                _log10: Math.log10,
                _max_: Math.max,
                _min_: Math.min,
                _remainder:function(x, y) { return x - Math.round(x/y) * y; },
                _pow: Math.pow,
                _round: Math.fround,
                _sin: Math.sin,
                _sqrt: Math.sqrt,
                _tan: Math.tan,
                _acosh: Math.acosh,
                _asinh: Math.asinh,
                _atanh: Math.atanh,
                _cosh: Math.cosh,
                _sinh: Math.sinh,
                _tanh: Math.tanh,
                
                memory: wasm_memory,
                
                table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
            }
        }

        // wasm mixer
        this.mixer = new WebAssembly.Instance(fluteMIDIPolyProcessor.wasm_mixer_module, this.mixerObject).exports;

        // wasm instance
        this.factory = new WebAssembly.Instance(fluteMIDIPolyProcessor.wasm_module, this.importObject).exports;
        
        // wasm effect
        this.effect = (fluteMIDIPolyProcessor.wasm_effect_module) ? new WebAssembly.Instance(fluteMIDIPolyProcessor.wasm_effect_module, this.importObject).exports : null;
        
        this.HEAP = wasm_memory.buffer;
        this.HEAP32 = new Int32Array(this.HEAP);
        this.HEAPF32 = new Float32Array(this.HEAP);
        
        // Warning: keeps a ref on HEAP in Chrome and prevent proper GC
        //console.log(this.HEAP);
        //console.log(this.HEAP32);
        //console.log(this.HEAPF32);
        
        // bargraph
        this.outputs_timer = 5;
        this.outputs_items = [];
        
        // input items
        this.inputs_items = [];
        
        // Start of HEAP index
        this.audio_heap_ptr = 0; // Fails when 0...
        
        // Setup pointers offset
        this.audio_heap_ptr_inputs = this.audio_heap_ptr;
        this.audio_heap_ptr_outputs = this.audio_heap_ptr_inputs + (this.numIn * this.ptr_size);
        this.audio_heap_ptr_mixing = this.audio_heap_ptr_outputs + (this.numOut * this.ptr_size);
        
        // Setup buffer offset
        this.audio_heap_inputs = this.audio_heap_ptr_mixing + (this.numOut * this.ptr_size);
        this.audio_heap_outputs = this.audio_heap_inputs + (this.numIn * fluteMIDIPolyProcessor.buffer_size * this.sample_size);
        this.audio_heap_mixing = this.audio_heap_outputs + (this.numOut * fluteMIDIPolyProcessor.buffer_size * this.sample_size);
        
        // Setup DSP voices offset
        this.dsp_start = this.audio_heap_mixing + (this.numOut * fluteMIDIPolyProcessor.buffer_size * this.sample_size);
        
        if (this.debug) {
            console.log(this.mixer);
            console.log(this.factory);
            console.log(this.effect);
        }
        
        // Start of DSP memory ('polyphony' DSP voices)
        this.polyphony = options.processorOptions.polyphony;
        this.dsp_voices = [];
        this.dsp_voices_state = [];
        this.dsp_voices_level = [];
        this.dsp_voices_date = [];
        
        this.kActiveVoice = 0;
        this.kFreeVoice = -1;
        this.kReleaseVoice = -2;
        this.kNoVoice = -3;
     
        this.pathTable = [];
        
        // Allocate table for 'setParamValue'
        this.value_table = [];
        
        for (var i = 0; i < this.polyphony; i++) {
            this.dsp_voices[i] = this.dsp_start + i * parseInt(this.json_object.size);
            this.dsp_voices_state[i] = this.kFreeVoice;
            this.dsp_voices_level[i] = 0;
            this.dsp_voices_date[i] = 0;
        }
        
        // Effect memory starts after last voice
        this.effect_start = this.dsp_voices[this.polyphony - 1] + parseInt(this.json_object.size);
        
        this.printMemory = function ()
        {
            console.log("============== Memory layout ==============");
            console.log("json_object.size: " + this.json_object.size);
            
            console.log("audio_heap_ptr: " + this.audio_heap_ptr);
            
            console.log("audio_heap_ptr_inputs: " + this.audio_heap_ptr_inputs);
            console.log("audio_heap_ptr_outputs: " + this.audio_heap_ptr_outputs);
            console.log("audio_heap_ptr_mixing: " + this.audio_heap_ptr_mixing);
            
            console.log("audio_heap_inputs: " + this.audio_heap_inputs);
            console.log("audio_heap_outputs: " + this.audio_heap_outputs);
            console.log("audio_heap_mixing: " + this.audio_heap_mixing);
            
            console.log("dsp_start: " + this.dsp_start);
            for (var i = 0; i <  this.polyphony; i++) {
                console.log("dsp_voices[i]: " + i + " " + this.dsp_voices[i]);
            }
            console.log("effect_start: " + this.effect_start);
        }
    
        this.getPlayingVoice = function(pitch)
        {
            var voice_playing = this.kNoVoice;
            var oldest_date_playing = Number.MAX_VALUE;
            
            for (var i = 0; i <  this.polyphony; i++) {
                if (this.dsp_voices_state[i] === pitch) {
                    // Keeps oldest playing voice
                    if (this.dsp_voices_date[i] < oldest_date_playing) {
                        oldest_date_playing = this.dsp_voices_date[i];
                        voice_playing = i;
                    }
                }
            }
            
            return voice_playing;
        }
        
        // Always returns a voice
        this.allocVoice = function(voice)
        {
            // so that envelop is always re-initialized
            this.factory.instanceClear(this.dsp_voices[voice]);
            this.dsp_voices_date[voice] = this.fDate++;
            this.dsp_voices_state[voice] = this.kActiveVoice;
            return voice;
        }
        
        this.getFreeVoice = function()
        {
            for (var i = 0; i <  this.polyphony; i++) {
                if (this.dsp_voices_state[i] === this.kFreeVoice) {
                    return this.allocVoice(i);
                }
            }
            
            var voice_release = this.kNoVoice;
            var voice_playing = this.kNoVoice;
            var oldest_date_release = Number.MAX_VALUE;
            var oldest_date_playing = Number.MAX_VALUE;
            
            // Scan all voices
            for (var i = 0; i <  this.polyphony; i++) {
                // Try to steal a voice in kReleaseVoice mode...
                if (this.dsp_voices_state[i] === this.kReleaseVoice) {
                    // Keeps oldest release voice
                    if (this.dsp_voices_date[i] < oldest_date_release) {
                        oldest_date_release = this.dsp_voices_date[i];
                        voice_release = i;
                    }
                } else {
                    if (this.dsp_voices_date[i] < oldest_date_playing) {
                        oldest_date_playing = this.dsp_voices_date[i];
                        voice_playing = i;
                    }
                }
            }
            
            // Then decide which one to steal
            if (oldest_date_release != Number.MAX_VALUE) {
                if (this.debug) {
                    console.log("Steal release voice : voice_date = %d cur_date = %d voice = %d", this.dsp_voices_date[voice_release], this.fDate, voice_release);
                }
                return this.allocVoice(voice_release);
            } else if (oldest_date_playing != Number.MAX_VALUE) {
                if (this.debug) {
                    console.log("Steal playing voice : voice_date = %d cur_date = %d voice = %d", this.dsp_voices_date[voice_playing], this.fDate, voice_playing);
                }
                return this.allocVoice(voice_playing);
            } else {
                return this.kNoVoice;
            }
        }
        
        this.update_outputs = function ()
        {
            if (this.outputs_items.length > 0 && this.output_handler && this.outputs_timer-- === 0) {
                this.outputs_timer = 5;
                for (var i = 0; i < this.outputs_items.length; i++) {
                    this.output_handler(this.outputs_items[i], this.factory.getParamValue(this.dsp, this.pathTable[this.outputs_items[i]]));
                }
            }
        }
        
        this.midiToFreq = function (note)
        {
            return 440.0 * Math.pow(2.0, (note - 69.0) / 12.0);
        }
        
        this.initAux = function ()
        {
            var i;
            
            if (this.numIn > 0) {
                this.ins = this.audio_heap_ptr_inputs;
                for (i = 0; i < this.numIn; i++) {
                    this.HEAP32[(this.ins >> 2) + i] = this.audio_heap_inputs + ((fluteMIDIPolyProcessor.buffer_size * this.sample_size) * i);
                }
                
                // Prepare Ins buffer tables
                var dspInChans = this.HEAP32.subarray(this.ins >> 2, (this.ins + this.numIn * this.ptr_size) >> 2);
                for (i = 0; i < this.numIn; i++) {
                    this.dspInChannnels[i] = this.HEAPF32.subarray(dspInChans[i] >> 2, (dspInChans[i] + fluteMIDIPolyProcessor.buffer_size * this.sample_size) >> 2);
                }
            }
            
            if (this.numOut > 0) {
                // allocate memory for output and mixing arrays
                this.outs = this.audio_heap_ptr_outputs;
                this.mixing = this.audio_heap_ptr_mixing;
                
                for (i = 0; i < this.numOut; i++) {
                    this.HEAP32[(this.outs >> 2) + i] = this.audio_heap_outputs + ((fluteMIDIPolyProcessor.buffer_size * this.sample_size) * i);
                    this.HEAP32[(this.mixing >> 2) + i] = this.audio_heap_mixing + ((fluteMIDIPolyProcessor.buffer_size * this.sample_size) * i);
                }
                
                // Prepare Out buffer tables
                var dspOutChans = this.HEAP32.subarray(this.outs >> 2, (this.outs + this.numOut * this.ptr_size) >> 2);
                for (i = 0; i < this.numOut; i++) {
                    this.dspOutChannnels[i] = this.HEAPF32.subarray(dspOutChans[i] >> 2, (dspOutChans[i] + fluteMIDIPolyProcessor.buffer_size * this.sample_size) >> 2);
                }
            }
            
            // Parse UI part
            fluteMIDIPolyProcessor.parse_ui(this.json_object.ui, this, fluteMIDIPolyProcessor.parse_item2);
            
            if (this.effect) {
                fluteMIDIPolyProcessor.parse_ui(this.effect_json_object.ui, this, fluteMIDIPolyProcessor.parse_item2);
            }
     
            // keep 'keyOn/keyOff' labels
            for (i = 0; i < this.inputs_items.length; i++) {
                if (this.inputs_items[i].endsWith("/gate")) {
                    this.fGateLabel.push(this.pathTable[this.inputs_items[i]]);
                } else if (this.inputs_items[i].endsWith("/freq")) {
                    this.fKeyFun = (pitch) => { return this.midiToFreq(pitch); };
                    this.fFreqLabel.push(this.pathTable[this.inputs_items[i]]);
                } else if (this.inputs_items[i].endsWith("/key")) {
                    this.fKeyFun = (pitch) => { return pitch; };
                    this.fFreqLabel.push(this.pathTable[this.inputs_items[i]]);
                } else if (this.inputs_items[i].endsWith("/gain")) {
                    this.fVelFun = (vel) => { return vel/127.0; };
                    this.fGainLabel.push(this.pathTable[this.inputs_items[i]]);
                } else if (this.inputs_items[i].endsWith("/vel") || this.inputs_items[i].endsWith("/velocity")) {
                    this.fVelFun = (vel) => { return vel; };
                    this.fGainLabel.push(this.pathTable[this.inputs_items[i]]);
                }
            }
            
            // Init DSP voices
            for (i = 0; i < this.polyphony; i++) {
                this.factory.init(this.dsp_voices[i], sampleRate);  // 'sampleRate' is defined in AudioWorkletGlobalScope
            }
            
            // Init effect
            if (this.effect) {
                this.effect.init(this.effect_start, sampleRate);
            }
            
            // Print memory layout
            this.printMemory();
        }
        
        this.keyOn = function (channel, pitch, velocity)
        {
            var voice = this.getFreeVoice();
            if (this.debug) {
                console.log("keyOn voice %d", voice);
            }
            for (var i = 0; i < this.fFreqLabel.length; i++) {
                this.factory.setParamValue(this.dsp_voices[voice], this.fFreqLabel[i], this.fKeyFun(pitch));
            }
            for (var i = 0; i < this.fGateLabel.length; i++) {
                this.factory.setParamValue(this.dsp_voices[voice], this.fGateLabel[i], 1.0);
            }
            for (var i = 0; i < this.fGainLabel.length; i++) {
                this.factory.setParamValue(this.dsp_voices[voice], this.fGainLabel[i], this.fVelFun(velocity));
            }
            this.dsp_voices_state[voice] = pitch;
        }
        
        this.keyOff = function (channel, pitch, velocity)
        {
            var voice = this.getPlayingVoice(pitch);
            if (voice !== this.kNoVoice) {
                if (this.debug) {
                    console.log("keyOff voice %d", voice);
                }
                // No use of velocity for now...
                for (var i = 0; i < this.fGateLabel.length; i++) {
                    this.factory.setParamValue(this.dsp_voices[voice], this.fGateLabel[i], 0.0);
                }
                // Release voice
                this.dsp_voices_state[voice] = this.kReleaseVoice;
            } else {
                if (this.debug) {
                    console.log("Playing voice not found...");
                }
            }
        }
        
        this.allNotesOff = function ()
        {
            for (var i = 0; i < this.polyphony; i++) {
                for (var j = 0; j < this.fGateLabel.length; j++) {
                    this.factory.setParamValue(this.dsp_voices[i], this.fGateLabel[j], 0.0);
                }
                this.dsp_voices_state[i] = this.kReleaseVoice;
            }
        }
        
        this.ctrlChange = function (channel, ctrl, value)
        {
            if (ctrl === 123 || ctrl === 120) {
                this.allNotesOff();
            }
            
            if (this.fCtrlLabel[ctrl] !== []) {
                for (var i = 0; i < this.fCtrlLabel[ctrl].length; i++) {
                    var path = this.fCtrlLabel[ctrl][i].path;
                    this.setParamValue(path, fluteMIDIPolyProcessor.remap(value, 0, 127, this.fCtrlLabel[ctrl][i].min, this.fCtrlLabel[ctrl][i].max));
                    if (this.output_handler) {
                   		this.output_handler(path, this.getParamValue(path));
                   	}
                }
            }
        }
        
        this.pitchWheel = function (channel, wheel)
        {
            for (var i = 0; i < this.fPitchwheelLabel.length; i++) {
                var pw = this.fPitchwheelLabel[i];
                this.setParamValue(pw.path, fluteMIDIPolyProcessor.remap(wheel, 0, 16383, pw.min, pw.max));
                if (this.output_handler) {
                   	this.output_handler(pw.path, this.getParamValue(pw.path));
                }
            }
        }
        
        this.setParamValue = function (path, val)
        {
            if (this.effect && getJSONeffect().includes(path)) {
                this.effect.setParamValue(this.effect_start, this.pathTable[path], val);
            } else {
                for (var i = 0; i < this.polyphony; i++) {
                    this.factory.setParamValue(this.dsp_voices[i], this.pathTable[path], val);
                }
            }
        }

        this.getParamValue = function (path)
        {
            if (this.effect && getJSONeffect().includes(path)) {
                return this.effect.getParamValue(this.effect_start, this.pathTable[path]);
            } else {
                return this.factory.getParamValue(this.dsp_voices[0], this.pathTable[path]);
            }
        }
            
        // Init resulting DSP
        this.initAux();
        
        // Set message handler
        this.port.onmessage = this.handleMessage.bind(this);
    }
   
    handleMessage(event) 
    {
        var msg = event.data;
        switch (msg.type) {
            // Generic MIDI message
            case "midi": this.midiMessage(msg.data); break;
            // Typed MIDI message
            case "keyOn": this.keyOn(msg.data[0], msg.data[1], msg.data[2]); break;
            case "keyOff": this.keyOff(msg.data[0], msg.data[1], msg.data[2]); break;
            case "ctrlChange": this.ctrlChange(msg.data[0], msg.data[1], msg.data[2]); break;
            case "pitchWheel": this.pitchWheel(msg.data[0], msg.data[1]); break;
            // Generic data message
            case "param": this.setParamValue(msg.key, msg.value); break;
            //case "patch": this.onpatch(msg.data); break;
            case "destroy": this.running = false; break;
        }
    }
  	
    midiMessage(data)
    {
        var cmd = data[0] >> 4;
        var channel = data[0] & 0xf;
        var data1 = data[1];
        var data2 = data[2];

        if (channel === 9) {
            return;
        } else if (cmd === 8 || ((cmd === 9) && (data2 === 0))) {
            this.keyOff(channel, data1, data2);
        } else if (cmd === 9) {
            this.keyOn(channel, data1, data2);
        } else if (cmd === 11) {
            this.ctrlChange(channel, data1, data2);
        } else if (cmd === 14) {
            this.pitchWheel(channel, (data2 * 128.0 + data1));
        }
    }
    
    process(inputs, outputs, parameters) 
    {
        var input = inputs[0];
        var output = outputs[0];
        
        // Check inputs
        if (this.numIn > 0 && (!input || !input[0] || input[0].length === 0)) {
            //console.log("Process input error");
            return true;
        }
        // Check outputs
        if (this.numOut > 0 && (!output || !output[0] || output[0].length === 0)) {
            //console.log("Process output error");
            return true;
        }
        
        // Copy inputs
        if (input !== undefined) {
            for (var chan = 0; chan < Math.min(this.numIn, input.length); ++chan) {
                var dspInput = this.dspInChannnels[chan];
                dspInput.set(input[chan]);
            }
        }
       
        // Possibly call an externally given callback (for instance to synchronize playing a MIDIFile...)
        if (this.compute_handler) {
            this.compute_handler(fluteMIDIPolyProcessor.buffer_size);
        }
         
        // First clear the outputs
        this.mixer.clearOutput(fluteMIDIPolyProcessor.buffer_size, this.numOut, this.outs);
        
        // Compute all running voices
        try {
            for (var i = 0; i < this.polyphony; i++) {
                if (this.dsp_voices_state[i] != this.kFreeVoice) {
                    // Compute voice
                    this.factory.compute(this.dsp_voices[i], fluteMIDIPolyProcessor.buffer_size, this.ins, this.mixing);
                    // Mix it in result
                    this.dsp_voices_level[i] = this.mixer.mixVoice(fluteMIDIPolyProcessor.buffer_size, this.numOut, this.mixing, this.outs);
                    // Check the level to possibly set the voice in kFreeVoice again
                    if ((this.dsp_voices_level[i] < 0.0005) && (this.dsp_voices_state[i] === this.kReleaseVoice)) {
                        this.dsp_voices_state[i] = this.kFreeVoice;
                    }
                }
            }

            // Apply effect
            if (this.effect) {
                this.effect.compute(this.effect_start, fluteMIDIPolyProcessor.buffer_size, this.outs, this.outs);
            }
        } catch(e) {
        	console.log("ERROR in compute (" + e + ")");
        }
        
        // Update bargraph
        this.update_outputs();
        
        // Copy outputs
        if (output !== undefined) {
            for (var chan = 0; chan < Math.min(this.numOut, output.length); ++chan) {
                var dspOutput = this.dspOutChannnels[chan];
                output[chan].set(dspOutput);
            }
        }
        
        return this.running;
    }
}

// Globals
fluteMIDIPolyProcessor.buffer_size = 128;

// Synchronously compile and instantiate the WASM modules
try {
    if (fluteMIDIPolyProcessor.wasm_mixer_module == undefined) {
        fluteMIDIPolyProcessor.wasm_mixer_module = new WebAssembly.Module(fluteMIDIPolyProcessor.atob(getBase64Mixer()));
        fluteMIDIPolyProcessor.wasm_module = new WebAssembly.Module(fluteMIDIPolyProcessor.atob(getBase64CodefluteMIDI()));
        // Possibly compile effect
        if (typeof (getBase64Codeeffect) !== "undefined") {
            fluteMIDIPolyProcessor.wasm_effect_module = new WebAssembly.Module(fluteMIDIPolyProcessor.atob(getBase64Codeeffect()));
        }
        registerProcessor('fluteMIDIPoly', fluteMIDIPolyProcessor);
    }
} catch (e) {
    console.log(e); console.log("Faust fluteMIDIPoly cannot be loaded or compiled");
}


