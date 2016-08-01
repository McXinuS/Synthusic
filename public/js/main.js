var keyboard;
var sound;
var oscilloscope;

var playing = [];

var instr;

document.addEventListener("DOMContentLoaded", function () {
	init();
	reset();
});

function init(){
	instr = instruments.piano;
	noteLibInit('C', 2, 'B', 5, scales.flat.scale);
	
	var oscCanvas = document.getElementById('osc-canvas');
	var oscDiv = oscCanvas.parentNode;
	// get oscDiv content width by creating a new div and getting its width
	var oscDivTemp = document.createElement('div');
	oscDiv.appendChild(oscDivTemp);
	var oscDivTempStyle = window.getComputedStyle(oscDivTemp, null);
	var oscDivW = oscDivTempStyle.getPropertyValue("width");
	oscDiv.removeChild(oscDivTemp);
	oscCanvas.setAttribute('width', oscDivW);
	oscCanvas.setAttribute('height', '500px');
	oscilloscope = new Oscilloscope(oscCanvas);

	keyboard = new Keyboard(document.getElementById("keyboard"));

	window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
	sound = new Sound(window.audioContext);
}

function reset(){
	instr = instruments.piano;
	setMasterGain(0);
}

// display info about selected note in the 'note-info' div
function updateNoteBox(note) {
	$('div.freq > span.label-value').text(note.freq.toFixed(2));
	$('div.note > span.label-value').text(note.name + note.octave);

	document.getElementById("note-range").value = note.index;
	var gainRng = document.getElementById("gain-range");
	var g = getGain(note);
	$('div.gain > span.label-value').text(g.toFixed(2));
	gainRng.value = g;
	gainRng.disabled = (g == 0);
}

// display info about selected note in the 'note-info' div
function playNote(note) {
	playing[note.index] = true;
	oscilloscope.addNote(note);
	sound.playNote(note);
	updateNoteBox(note);
	keyboard.highlightOn(note);
	console.log(note.name + note.octave + ' is now playing');
}

// TODO: BPM

// play a random note from a scale
// Warning! This function is full of dirty hacks =/
function playRandomFromScale(key, sc){
	var note;
	
	// try to get a note within a range of currently playable notes
	// made it with iteration because of laziness
	var iter = 0;
	var iter_max = 20;
	var ok = false;
	while (iter<iter_max && !ok){
		var interval = 0;
		var step = Math.round(Math.random() * sc.intervals.length);
		for (var i=0; i<step; i++)
			interval += sc.intervals[i];
		
		var oct_max = notesCount/12;
		var octave = Math.round(Math.random() * oct_max) - 1;
		
		//console.log('octave: ' + octave);
		var index = scale.indexOf(key) + interval + octave*12;
		if (index < notesCount && index >= 0){
			ok = true;
			note = getNote(index);
		}
		iter++;
	}
	if (ok){
		var bpm = document.getElementById('bpm').value;
		playNote(note);
		setTimeout(function () {
			stopNote(note)
		}, 60 * 1000 / bpm);
	}
}

function stopNote(note) {
	playing[note.index] = false;
	oscilloscope.removeNote(note);
	sound.stopNote(note);
	updateNoteBox(note);
	keyboard.highlightOff(note);
	console.log(note.name + note.octave + ' has been stopped');
}

function stop() {
	oscilloscope.reset();
	sound.stop();
	keyboard.highlightClear();
	playing = [];
	console.log('Playing has been stopped on ' + note.name + note.octave);
}

function getGain(note){
	return sound.getGain(note);
}

function getMasterGain(){
	return sound.getMasterGain();
}

// set gain of the note's gainNode
function setGain(note, gain){
	sound.setGain(note, gain);
	$('div.gain > span.label-value').text(gain);
	document.getElementById("gain-range").value = gain;
}

// set gain of the masterGainNode
function setMasterGain(gain){
	sound.setMasterGain(gain);
	document.getElementById("master-gain-range").value = gain;
	$('div.master-gain > span.label-value').text(gain);
	document.getElementById("mute-btn").innerText = gain == 0 ? "Play" : "Mute";
}




/*Set up event handlers*/
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

	var noteR = document.getElementById('note-range');
	var gainR = document.getElementById('gain-range');
	gainR.oninput = function () {
		var n = getNote(noteR.value);
		setGain(n, gainR.value);
	};

	var masterGain = document.getElementById('master-gain-range');
	masterGain.oninput = function () {
		setMasterGain(masterGain.value);
	};

	var mute = document.getElementById('mute-btn');
	mute.onclick = function () {
		setMasterGain(masterGain.value == 0 ? sound.maxGain : 0);
	};

	var bpmInput = document.getElementById('bpm');
	bpmInput.oninput = function () {
		$('#bpm-label').find('> span.label-value').text(bpmInput.value);
	};

	var random = document.getElementById('random-btn');
	random.onclick = function () {
		playRandomFromScale('C', actual_scales.pentaMajor);
	};

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
	$("#keyboard-up").attachKeyboardDragger();

	var scCont = $('#scale-list').find('ul');
	for (var index in scales) {
		var li = document.createElement('li');
		var a = document.createElement('a');
		a.setAttribute('href', '#');
		a.innerText = scales[index].name;
		li.appendChild(a);
		scCont.append(li);
	}
	var insCont = $('#instr-list').find('ul');
	for (var index in instruments) {
		var li = document.createElement('li');
		var a = document.createElement('a');
		a.setAttribute('href', '#');
		a.innerText = instruments[index].name;
		li.appendChild(a);
		insCont.append(li);
	}

	// TODO
	$("#instr-list > .dropdown-menu").on("click", "li", function (event) {
				console.log(instruments.length);
		for (var i=0; i<instruments.length; i++){
			if (instruments[i].name == event.target.innerHTML){
				instr = instruments[i];
				console.log("Instrument has been changed to ", event.target.innerHTML);
			}
		}
	});

	$('[data-toggle="tooltip"]').tooltip();
});