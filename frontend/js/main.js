// TODO: add listeners
import 'jquery';
import 'bootstrap/dist/js/bootstrap';
import {Socket}       from "./websocket.js";
import {Oscilloscope} from "./ui/oscilloscope.js";
import {Sound}        from "./sound/sound.js";
import {Keyboard}     from "./ui/keyboard.js";
import {Ui}           from "./ui/ui.js";

var _main = new Main();

// Babel6 workaround http://stackoverflow.com/questions/34736771/webpack-umd-library-return-object-default/34778391
export default _main;
module.exports = _main;

var masterGainBeforeMute;


function Main() {

	this._bpm = 0;

	var self = this;

	Object.defineProperties(this, {
		playing: {
			value: [],
			writable: true
		},
		//TODO move to config
		bpm: {
			get: function () {
				return self._bpm;
			},
			set: function (bpm) {
				self._bpm = bpm;
				self.ui.updateBpm(bpm)
			}
		},
		masterGain: {
			get: function () {
				return self.sound.getMasterGain();
			},
			set: function (gain) {
				if (self.masterGain == gain)
					return;

				self.sound.setMasterGain(gain);
				self.ui.updateMasterGain(gain);
			}
		},
		scale: {
			get: function () {
				return __config.SCALE;
			},
			set: function (sc) {
				if (__config.SCALE == sc)
					return;

				__config.SCALE = sc;
				self.ui.updateScale(sc);
			}
		},
		instrument: {
			get: function () {
				return __config.instrument;
			},
			set: function (instrumentName) {
				if (__config.instrument != undefined && __config.instrument.name == instrumentName)
					return;

				for (let index in __config.INSTRUMENTS) {
					if (__config.INSTRUMENTS[index].name == instrumentName) {
						if (typeof(self.sound) != 'undefined') self.sound.instrument = __config.INSTRUMENTS[index];
						self.reset(function (instrumentName) {
							__config.instrument = instrumentName;
						}, __config.INSTRUMENTS[index]);
						self.ui.updateInstrument(__config.INSTRUMENTS[index]);
						console.log(`Instrument has been changed to ${instrumentName}`);
						break;
					}
				}
			}
		}
	});

	this.gain = new Proxy({}, {
		get: function (target, note) {
			return self.sound.getGain(note);
		},
		set: function (target, note, gain) {
			self.sound.setGain(note, gain);
			self.ui.noteInfoGainLabel.text(gain);
			self.ui.noteInfoGainRange.value = gain;
			return true;
		}
	});

	document.addEventListener("DOMContentLoaded", function () {
		self.init();
	});

}


Main.prototype.init = function () {

	this.ui = new Ui();

	this.instrument = 'Organ';
	this.bpm = 60;

	this.oscilloscope = new Oscilloscope(this.ui.oscCanvas);
	window.addEventListener('resize', function () {
		main.oscilloscope.onResize();
	}, true);

	this.keyboard = new Keyboard(this.ui.keyboardContainer);

	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	window.audioContext = audioContext;
	this.sound = new Sound(audioContext, this.instrument);

	this.masterGain = __config.MASTER_GAIN_MAX / 2;

	this.socket = new Socket(__config.WEB_SOCKET_HOST);
	this.socket.onmessage = onSocketMessage;

};

Main.prototype.reset = function (callback, callbackArgs) {

	var pl = this.playing;
	this.stop({notify: false});

	callback(callbackArgs);

	for (var index in pl) {
		if (!pl[index]) {
			continue;
		}
		var note = __note.getNote(index);
		this.playNote({note: note});
	}

};

Main.prototype.playNote = function (parameters) {
	var note = parameters.note;
	var duration = parameters.duration;
	var notify = parameters.notify;

	if (this.playing[note.index])
		return;

	this.playing[note.index] = true;
	this.sound.playNote(note, duration);

	this.oscilloscope.addNote(note);
	this.keyboard.highlightOn(note);
	this.observeInNoteBox(note);

	if (notify == undefined) {
		notify = true;
	}
	if (notify) {
		this.socket.send({
			type: __config.WEB_SOCKET_MESSAGE_TYPE.play_note,
			noteName: note.name,
			noteOctave: note.octave
		});
	}

	console.log(note.name + note.octave + ' is now playing');
};

Main.prototype.stopNote = function (parameters) {
	var note = parameters.note;
	var notify = parameters.notify;

	if (!this.playing[note.index])
		return;

	this.playing[note.index] = false;
	this.sound.stopNote(note);

	this.oscilloscope.removeNote(note);
	this.keyboard.highlightOff(note);
	this.observeInNoteBox(note);

	if (notify == undefined) {
		notify = true;
	}
	if (notify) {
		this.socket.send({
			type: __config.WEB_SOCKET_MESSAGE_TYPE.stop_note,
			noteName: note.name,
			noteOctave: note.octave
		});
	}
	console.log(note.name + note.octave + ' has been stopped');
};

// play a random note from a scale
// Warning! This function is full of dirty hacks =/
Main.prototype.playRandomNote = function () {
	var note;

	// try to get a note within a range of currently playable notes
	// made it using iterations because of laziness
	var iter = 0;
	var iter_max = 20;
	var ok = false;
	while (iter < iter_max) {
		var interval = 0;
		var step = Math.round(Math.random() * this.scale.intervals.length);
		for (var i = 0; i < step; i++)
			interval += this.scale.intervals[i];

		var oct_max = __config.NOTES_COUNT / 12;
		var octave = Math.round(Math.random() * oct_max) - 1;

		var index = scale.indexOf('C') + interval + octave * 12;
		if (index < __config.NOTES_COUNT && index >= 0) {
			ok = true;
			note = __note.getNote(index);
			break;
		}
		iter++;
	}
	if (ok) {
		var duration = 60 * 1000 / this.bpm;
		this.playNote({note: note, duration: duration});
	}
};

Main.prototype.stop = function (parameters) {
	var notify = parameters.notify;

	if (typeof(this.oscilloscope) != 'undefined') this.oscilloscope.stop();
	if (typeof(this.sound) != 'undefined') this.sound.stop();
	if (typeof(this.keyboard) != 'undefined') this.keyboard.highlightClear();

	this.playing = [];

	if (notify == undefined) notify = true;
	if (notify) {
		this.socket.send({
			type: __config.WEB_SOCKET_MESSAGE_TYPE.stop
		});
	}
	console.log('Stop');
};

Main.prototype.toggleMute = function () {
	if (masterGainRange.value > 0) {
		masterGainBeforeMute = masterGainRange.value;
		this.masterGain = 0;
	} else {
		this.masterGain = masterGainBeforeMute;
	}
};

Main.prototype.observeInNoteBox = function (note) {
	this.ui.noteBox.setObserve(note);
};

function onSocketMessage(data) {
	var type = data.type;

	switch (type) {
		case __config.WEB_SOCKET_MESSAGE_TYPE.play_note:
			let name = data.noteName;
			let octave = data.noteOctave;
			let note = __note.getNote(name, octave);
			main.playNote({note: note, notify: false});
			break;
		case __config.WEB_SOCKET_MESSAGE_TYPE.stop_note:
			name = data.noteName;
			octave = data.noteOctave;
			note = __note.getNote(name, octave);
			main.stopNote({note: note, notify: false});
			break;
		case __config.WEB_SOCKET_MESSAGE_TYPE.stop:
			main.stop({notify: false});
			break;
		case __config.WEB_SOCKET_MESSAGE_TYPE.change_instrument:
			main.instrument = data.instrumentName;
			break;
	}
}