// DOM objects
// Settings
var masterGainLabel;
var masterGainRange;
var instrumentList;
var instrumentListLabel;
var bpmLabel;
var bpmRange;
// Instrument box
var noteInfoFreq;
var noteInfoNote;
var noteInfoGainLabel;
var noteInfoNoteRange;
var noteInfoGainRange;

var masterGainBeforeMute;
var playing = [];
var instrument;
var scale;

var keyboard;
var sound;
var oscilloscope;
var socket;

document.addEventListener("DOMContentLoaded", function () {
	init();
});

function init() {
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

	setInstrument('Piano');
	noteLibInit(NOTE_START[0], NOTE_START[1], NOTE_END[0], NOTE_END[1], ACCIDENTALS.flat.scale);

	var oscCanvas = document.getElementById('osc-canvas');
	var oscDiv = oscCanvas.parentNode;
	// hack: get oscDiv content width by creating a new div and getting its width
	var oscDivTemp = document.createElement('div');
	oscDiv.appendChild(oscDivTemp);
	var oscDivTempStyle = window.getComputedStyle(oscDivTemp, null);
	var oscDivW = oscDivTempStyle.getPropertyValue("width");
	oscDiv.removeChild(oscDivTemp);
	oscCanvas.setAttribute('width', oscDivW);
	oscCanvas.setAttribute('height', '500px');
	oscilloscope = new Oscilloscope(oscCanvas);

	var keyboardContainer = document.getElementById("keyboard");
	keyboard = new Keyboard(keyboardContainer);
	noteInfoNoteRange.setAttribute("min", "0");
	noteInfoNoteRange.setAttribute("max", notesCount - 1);

	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	window.audioContext = audioContext;
	sound = new Sound(audioContext);

	setMasterGain(0.25);
	setBpm(60);

	socket = new Socket(WEB_SOCKET_HOST_LOCALHOST, onSocketMessage);
}

function reset(callback, callbackArgs) {
	if (Object.keys(playing).length == 0) {
		callback(callbackArgs);
		return;
	}
	var pl = playing;
	stop({notify: false});

	callback(callbackArgs);

	for (var index in pl) {
		if (!pl[index]) {
			continue;
		}
		var note = getNote(index);
		playNote({note: note});
	}
}

function playNote(parameters) {
	var note = parameters.note;
	var duration = parameters.duration;
	var notify = parameters.notify;

	if (playing[note.index])
		return;

	playing[note.index] = true;
	sound.playNote(note, duration);

	oscilloscope.addNote(note);
	keyboard.highlightOn(note);
	updateNoteBox(note);

	if (notify == undefined) {
		notify = true;
	}
	if (notify) {
		socket.send({
			type: WEB_SOCKET_MESSAGE_TYPE.play_note,
			noteName: note.name,
			noteOctave: note.octave
		});
	}

	console.log(note.name + note.octave + ' is now playing');
}

function stopNote(parameters) {
	var note = parameters.note;
	var notify = parameters.notify;

	console.log(playing);
	if (!playing[note.index])
		return;

	playing[note.index] = false;
	sound.stopNote(note);

	oscilloscope.removeNote(note);
	keyboard.highlightOff(note);
	updateNoteBox(note);

	if (notify == undefined) {
		notify = true;
	}
	if (notify) {
		socket.send({
			type: WEB_SOCKET_MESSAGE_TYPE.stop_note,
			noteName: note.name,
			noteOctave: note.octave
		});
	}
	console.log(note.name + note.octave + ' has been stopped');
}

// play a random note from a scale
// Warning! This function is full of dirty hacks =/
function playRandomFromScale(key, sc) {
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

		//console.log('octave: ' + octave);
		var index = scale.indexOf(key) + interval + octave * 12;
		if (index < notesCount && index >= 0) {
			ok = true;
			note = getNote(index);
		}
		iter++;
	}
	if (ok) {
		var bpm = getBpm();
		var duration = 60 * 1000 / bpm;
		playNote({note: note, duration: duration});
	}
}

function stop(parameters) {
	var notify = parameters.notify;

	oscilloscope.reset();
	sound.stop();
	keyboard.highlightClear();
	playing = [];

	if (notify == undefined) {
		notify = true;
	}
	if (notify) {
		socket.send({
			type: WEB_SOCKET_MESSAGE_TYPE.stop,
		});
	}
	console.log('Stop');
}

function getBpm() {
	return bpmRange.value;
}

function setBpm(bpm) {
	bpmRange.value = bpm;
	bpmLabel.text(bpm);
}

function getGain(note) {
	return sound.getGain(note);
}

function setGain(note, gain) {
	sound.setGain(note, gain);
	noteInfoGainLabel.text(gain);
	noteInfoGainRange.value = gain;
}

function getMasterGain() {
	return sound.getMasterGain();
}

function setMasterGain(gain) {
	if (getMasterGain() == gain)
		return;

	sound.setMasterGain(gain);
	masterGainLabel.text(gain);
	masterGainRange.value = gain;
	document.getElementById("mute-btn").innerText = gain == 0 ? "Play" : "Mute";
}

function getScale() {
	return scale;
}

function setScale(sc) {
	if (getScale() == sc)
		return;

	scale = sc;
	// TODO
	//scaleLabel.text(sc.name);
	reset();
}

function getInstrument() {
	return instrument;
}

function setInstrument(instrumentName) {
	if (getInstrument() != undefined && getInstrument().name == instrumentName)
		return;

	for (var index in INSTRUMENTS) {
		if (INSTRUMENTS[index].name == instrumentName) {
			reset(function (instrumentName) {
				instrument = instrumentName;
			}, INSTRUMENTS[index]);
			instrumentListLabel.html(instrumentName + '<span class="caret"></span>');
			console.log("Instrument has been changed to", instrumentName);
			break;
		}
	}
}

function toggleMute() {
	if (masterGainRange.value > 0) {
		masterGainBeforeMute = masterGainRange.value;
		setMasterGain(0);
	} else {
		setMasterGain(masterGainBeforeMute);
	}
}

// display info about selected note in the 'note-info' div
function updateNoteBox(note) {
	noteInfoFreq.text(note.freq.toFixed(2));
	noteInfoNote.text(note.name + note.octave);

	noteInfoNoteRange.value = note.index;
	var gain = getGain(note);
	noteInfoGainLabel.text(gain.toFixed(2));
	noteInfoGainRange.value = gain;
	noteInfoGainRange.disabled = (gain == 0);
}

function onSocketMessage(data) {
	var type = data.type;

	switch (type) {
		case WEB_SOCKET_MESSAGE_TYPE.play_note:
			var name = data.noteName;
			var octave = data.noteOctave;
			var note = getNote(name, octave);
			playNote({note: note, notify: false});
			break;
		case WEB_SOCKET_MESSAGE_TYPE.stop_note:
			var name = data.noteName;
			var octave = data.noteOctave;
			var note = getNote(name, octave);
			stopNote({note: note, notify: false});
			break;
		case WEB_SOCKET_MESSAGE_TYPE.stop:
			stop({notify: false});
			break;
		case WEB_SOCKET_MESSAGE_TYPE.change_instrument:
			var instr = data.instrumentName;
			setInstrument(instr, false);
			break;
	}
}


document.addEventListener("DOMContentLoaded", function () {

	var setTitle = document.getElementById('settings').getElementsByClassName('container-title')[0];
	setTitle.onclick = function () {
		$('#settings-arrow').toggleClass('glyphicon-collapse-up glyphicon-collapse-down');
	};

	var insTitle = document.getElementById('instr-container').getElementsByClassName('container-title')[0];
	insTitle.onclick = function () {
		$('#keyboard').toggleClass('keyboard-mini');
		$('#instr-arrow').toggleClass('glyphicon-collapse-up glyphicon-collapse-down');
	};

	$("#keyboard-up").attachKeyboardDragger();

	var stopButton = document.getElementById('stop-btn');
	stopButton.onclick = function () {
		stop({notify: true});
	};

	var randomButton = document.getElementById('random-btn');
	randomButton.onclick = function () {
		playRandomFromScale('C', SCALES.pentatonicMajor);
	};

	noteInfoGainRange.oninput = function () {
		var n = getNote(noteInfoNoteRange.value);
		setGain(n, noteInfoGainRange.value);
	};

	masterGainRange.oninput = function () {
		setMasterGain(masterGainRange.value);
	};

	var mute = document.getElementById('mute-btn');
	mute.onclick = function () {
		toggleMute();
	};

	bpmRange.oninput = function () {
		setBpm(bpmRange.value);
	};

	var instrCont = $('#instr-list');
	var instrList = instrCont.find('ul');
	for (var index in INSTRUMENTS) {
		var li = document.createElement('li');
		var a = document.createElement('a');
		a.setAttribute('href', '#');
		a.innerText = INSTRUMENTS[index].name;
		li.appendChild(a);
		instrList.append(li);
	}

	instrCont.find("> .dropdown-menu").on("click", "li", function (event) {
		setInstrument(event.target.innerHTML);
	});

	$('[data-toggle="tooltip"]').tooltip();
});

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
	$(window).on("mouseup", function (e) {
		attachment = false;
	});
};