// TODO: add listeners
import 'jquery';
import 'bootstrap/dist/js/bootstrap';
import {Socket}       from "./websocket.js";
import {Oscilloscope} from "./oscilloscope.js";
import {Sound}        from "./sound.js";
import {Keyboard}     from "./keyboard.js";

var _main = new Main();
// babel6 workaround http://stackoverflow.com/questions/34736771/webpack-umd-library-return-object-default/34778391
export default _main;
module.exports = _main;

//  *** DOM objects ***
// Settings
var masterGainLabel, masterGainRange,
	instrumentListLabel, instrumentList,
	bpmLabel, bpmRange;
// Instrument box
var noteInfoFreq, noteInfoNote,
	noteInfoGainLabel, noteInfoGainRange,
	noteInfoNoteRange;

var masterGainBeforeMute;


function Main() {

	var self = this;

	Object.defineProperties(this, {
		playing: {
			value: [],
			writable: true
		},
		bpm: {
			get: function () {
				return bpmRange.value;
			},
			set: function (bpm) {
				bpmRange.value = bpm;
				bpmLabel.text(bpm);
			}
		},
		masterGain: {
			get: function () {
				return this.sound.getMasterGain();
			},
			set: function (gain) {
				if (self.masterGain == gain)
					return;

				this.sound.setMasterGain(gain);
				masterGainLabel.text(gain);
				masterGainRange.value = gain;
				document.getElementById("mute-btn").innerText = gain == 0 ? "Play" : "Mute";
			}
		},
		scale: {
			get: function () {
				return this._scale;
			},
			set: function (sc) {
				if (this._scale == sc)
					return;

				this._instrument = sc;
				// TODO
				//scaleLabel.text(sc.name);
			}
		},
		instrument: {
			get: function () {
				return this._instrument;
			},
			set: function (instrumentName) {
				if (this.instrument != undefined && this.instrument.name == instrumentName)
					return;

				for (var index in config.INSTRUMENTS) {
					if (config.INSTRUMENTS[index].name == instrumentName) {
						self.reset(function (instrumentName) {
							self._instrument = instrumentName;
						}, config.INSTRUMENTS[index]);
						instrumentListLabel.html(`${instrumentName} <span class="caret"></span>`);
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
			noteInfoGainLabel.text(gain);
			noteInfoGainRange.value = gain;
			return true;
		}
	});

	document.addEventListener("DOMContentLoaded", function () {
		self.init();
	});

}


Main.prototype.init = function () {

	this.initDomEvents();

	this.instrument = 'Organ';
	noteLibInit(config.NOTE_START[0], config.NOTE_START[1],
		config.NOTE_END[0], config.NOTE_END[1],
		config.ACCIDENTALS.sharp.scale);

	var oscCanvas = document.getElementById('oscilloscope-wrapper').firstElementChild ;
	this.oscilloscope = new Oscilloscope(oscCanvas);
	window.addEventListener('resize', function () {
		main.oscilloscope.onResize();
	}, true);

	var keyboardContainer = document.getElementById("keyboard");
	this.keyboard = new Keyboard(keyboardContainer);

	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	window.audioContext = audioContext;
	this.sound = new Sound(audioContext);

	this.masterGain = config.MASTER_GAIN_MAX / 2;
	this.bpm = 60;

	this.socket = new Socket(config.WEB_SOCKET_HOST);
	this.socket.onmessage = onSocketMessage;

};

Main.prototype.initDomEvents = function () {

	var self = this;

	instrumentList = $('#instr-list');
	instrumentListLabel = instrumentList.find('> button');
	masterGainRange = document.getElementById('master-gain-range');
	masterGainLabel = $('div.master-gain > span.label-value');
	bpmRange = document.getElementById('bpm-range');
	bpmLabel = $('#bpm-label').find('> span.label-value');
	noteInfoNoteRange = document.getElementById("note-info-note-range");
	noteInfoFreq = $('div.freq > span.label-value');
	noteInfoNote = $('div.note > span.label-value');
	noteInfoGainRange = document.getElementById("note-info-gain-range");
	noteInfoGainLabel = $('div.gain > span.label-value');

	var setTitle = document.getElementById('settings').getElementsByClassName('container-title')[0];
	setTitle.onclick = function () {
		$('#settings-arrow').toggleClass('glyphicon-collapse-up glyphicon-collapse-down');
	};

	var insTitle = document.getElementById('instr-container').getElementsByClassName('container-title')[0];
	insTitle.onclick = function () {
		$('#keyboard').toggleClass('keyboard-mini');
		$('#instr-arrow').toggleClass('glyphicon-collapse-up glyphicon-collapse-down');
	};

	var oscTitle = document.getElementById('oscilloscope').getElementsByClassName('container-title')[0];
	oscTitle.onclick = function () {
		$('#osc-arrow').toggleClass('glyphicon-collapse-up glyphicon-collapse-down');
	};

	masterGainRange.setAttribute("min", "0");
	masterGainRange.setAttribute("max", config.MASTER_GAIN_MAX.toString());
	masterGainRange.oninput = function () {
		main.masterGain = masterGainRange.value;
	};

	var stopButton = document.getElementById('stop-btn');
	stopButton.onclick = function () {
		main.stop({notify: true});
	};

	var randomButton = document.getElementById('random-btn');
	randomButton.onclick = function () {
		main.playRandomFromScale('C', config.SCALES.pentatonicMajor);
	};

	noteInfoNoteRange.setAttribute("min", "0");
	noteInfoNoteRange.setAttribute("max", (notesCount - 1).toString());
	noteInfoGainRange.oninput = function () {
		var n = getNote(noteInfoNoteRange.value);
		main.gain[n] = noteInfoGainRange.value;
	};

	var mute = document.getElementById('mute-btn');
	mute.onclick = function () {
		main.toggleMute();
	};

	bpmRange.oninput = function () {
		main.bpm = bpmRange.value;
	};

	var instrItems = instrumentList.find('ul');
	for (var index in config.INSTRUMENTS) {
		var li = document.createElement('li');
		var a = document.createElement('a');
		a.setAttribute('href', '#');
		a.innerText = config.INSTRUMENTS[index].name;
		li.appendChild(a);
		instrItems.append(li);
	}
	instrumentList.find("> .dropdown-menu").on("click", "li", function (event) {
		main.instrument = event.target.innerHTML;
	});

	var renderTypeList = $('#osc-render-type-list');
	renderTypeList.find("> .dropdown-menu").on("click", "li", function (event) {
		main.instrument = event.target.innerHTML;
	});

	$("#keyboard-up").attachKeyboardDragger();

	$(function () {
		$('[data-toggle="tooltip"]').tooltip()
	})

};

Main.prototype.reset = function (callback, callbackArgs) {

	var pl = this.playing;
	this.stop({notify: false});

	callback(callbackArgs);

	for (var index in pl) {
		if (!pl[index]) {
			continue;
		}
		var note = getNote(index);
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
	this.updateNoteBox(note);

	if (notify == undefined) {
		notify = true;
	}
	if (notify) {
		this.socket.send({
			type: config.WEB_SOCKET_MESSAGE_TYPE.play_note,
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
	this.updateNoteBox(note);

	if (notify == undefined) {
		notify = true;
	}
	if (notify) {
		this.socket.send({
			type: config.WEB_SOCKET_MESSAGE_TYPE.stop_note,
			noteName: note.name,
			noteOctave: note.octave
		});
	}
	console.log(note.name + note.octave + ' has been stopped');
};

// play a random note from a scale
// Warning! This function is full of dirty hacks =/
Main.prototype.playRandomFromScale = function (key, sc) {
	var note;

	// try to get a note within a range of currently playable notes
	// made it using iterations because of laziness
	var iter = 0;
	var iter_max = 20;
	var ok = false;
	while (iter < iter_max && !ok) {
		var interval = 0;
		var step = Math.round(Math.random() * sc.intervals.length);
		for (var i = 0; i < step; i++)
			interval += sc.intervals[i];

		var oct_max = notesCount / 12;
		var octave = Math.round(Math.random() * oct_max) - 1;

		var index = scale.indexOf(key) + interval + octave * 12;
		if (index < notesCount && index >= 0) {
			ok = true;
			note = getNote(index);
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
			type: config.WEB_SOCKET_MESSAGE_TYPE.stop
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

// display info about selected note in the 'note-info' div
Main.prototype.updateNoteBox = function (note) {
	var noteName = note.name + note.octave;
	var gain = this.gain[note];
	var isDisabled = gain == 0;
	if (noteInfoFreq.text != noteName && isDisabled) return;

	noteInfoFreq.text(note.freq.toFixed(2));
	noteInfoNote.text(noteName);

	noteInfoNoteRange.value = note.index;
	noteInfoGainLabel.text(gain.toFixed(2));
	noteInfoGainRange.value = gain;
	noteInfoGainRange.disabled = isDisabled;
};

function onSocketMessage(data) {
	var type = data.type;

	switch (type) {
		case config.WEB_SOCKET_MESSAGE_TYPE.play_note:
			let name = data.noteName;
			let octave = data.noteOctave;
			let note = getNote(name, octave);
			main.playNote({note: note, notify: false});
			break;
		case config.WEB_SOCKET_MESSAGE_TYPE.stop_note:
			name = data.noteName;
			octave = data.noteOctave;
			note = getNote(name, octave);
			main.stopNote({note: note, notify: false});
			break;
		case config.WEB_SOCKET_MESSAGE_TYPE.stop:
			main.stop({notify: false});
			break;
		case config.WEB_SOCKET_MESSAGE_TYPE.change_instrument:
			main.instrument = data.instrumentName;
			break;
	}
}

// scroll keyboard by dragging object
$.fn.attachKeyboardDragger = function () {
	var attachment = false;
	var lastPosition;
	var obj = $(this);
	var kb = $("#keyboard");

	obj.on("mousedown", function (e) {
		attachment = true;
		lastPosition = e.clientX;
	});
	$(window).on("mousemove", function (e) {
		if (attachment == true) {
			var difference = e.clientX - lastPosition;
			kb.scrollLeft(kb.scrollLeft() - difference);
			lastPosition = e.clientX;
		}
	});
	$(window).on("mouseup", function () {
		attachment = false;
	});
};