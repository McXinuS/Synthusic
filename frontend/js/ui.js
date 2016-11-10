exports.Ui = Ui;

function Ui() {
	/*
	 // Settings
	 var masterGainLabel, masterGainRange,
	 instrumentListLabel, instrumentList,
	 bpmLabel, bpmRange;
	 // Instrument box
	 var noteInfoFreq, noteInfoNote,
	 noteInfoGainLabel, noteInfoGainRange,
	 noteInfoNoteRange;
	 */

	this.init();
}

Ui.prototype.init = function () {

	var self = this;

	this.masterGainRange = document.getElementById('master-gain-range');
	this.masterGainLabel = $('div.master-gain > span.label-value');
	this.masterGainRange.setAttribute("max", config.MASTER_GAIN_MAX.toString());

	this.instrumentList = $('#instr-list');
	this.instrumentListLabel = this.instrumentList.find('> button');
	var instrItems = this.instrumentList.find('ul');
	for (var index in config.INSTRUMENTS) {
		var li = document.createElement('li');
		var a = document.createElement('a');
		a.setAttribute('href', '#');
		a.innerText = config.INSTRUMENTS[index].name;
		li.appendChild(a);
		instrItems.append(li);
	}
	this.instrumentList.find("> .dropdown-menu").on("click", "li", function (event) {
		main.instrument = event.target.innerHTML;
	});

	this.bpmRange = document.getElementById('bpm-range');
	this.bpmLabel = $('#bpm-label').find('> span.label-value');
	this.muteButton = document.getElementById("mute-btn");
	this.noteInfoNoteRange = document.getElementById("note-info-note-range");
	this.noteInfoFreq = $('div.freq > span.label-value');
	this.noteInfoNote = $('div.note > span.label-value');
	this.noteInfoGainRange = document.getElementById("note-info-gain-range");
	this.noteInfoGainLabel = $('div.gain > span.label-value');

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

	this.noteInfoNoteRange.setAttribute("min", "0");
	this.noteInfoNoteRange.setAttribute("max", (notesCount - 1).toString());
	this.noteInfoGainRange.oninput = function () {
		var n = getNote(self.noteInfoNoteRange.value);
		main.gain[n] = self.noteInfoGainRange.value;
	};

	var renderTypeList = $('#osc-render-type-list');
	renderTypeList.find("> .dropdown-menu").on("click", "li", function (event) {
		main.oscilloscope.renderType = event.target.getAttribute('data');
	});

	this.oscCanvas = document.getElementById('oscilloscope-wrapper').firstElementChild;
	this.keyboardContainer = document.getElementById("keyboard");

	$("#keyboard-up").attachKeyboardDragger();

	$(function () {
		$('[data-toggle="tooltip"]').tooltip()
	});

	this.noteBox = new NoteBox({
		noteRange: this.noteInfoNoteRange,
		noteLabel: this.noteInfoNote,
		freqLabel: this.noteInfoFreq,
		gainRange: this.noteInfoGainRange,
		gainLabel: this.noteInfoGainLabel
	});

};

Ui.prototype.updateBpm = function (value) {
	this.bpmRange.value = value;
	this.bpmLabel.text(value);
};

Ui.prototype.updateMasterGain = function (value) {
	this.masterGainLabel.text(value);
	this.masterGainRange.value = value;
	this.muteButton.innerText = value == 0 ? "Play" : "Mute";
};

// TODO
Ui.prototype.updateScale = function (value) {
};

Ui.prototype.updateInstrument = function (value) {
	this.instrumentListLabel.html(`${value.name} <span class="caret"></span>`);
};

function NoteBox(parameters) {
	this.noteRange = parameters.noteRange;
	this.noteLabel = parameters.noteLabel;
	this.freqLabel = parameters.freqLabel;
	this.gainRange = parameters.gainRange;
	this.gainLabel = parameters.gainLabel;

	this._updateRate = 5;
	this._note = undefined;

	this.update();
}

NoteBox.prototype.observe = function (note) {
	this._note = note;
};

// display info about selected note in the 'note-info' div
NoteBox.prototype.update = function () {
	if (typeof(this._note) != 'undefined') {
		var noteName = this._note.toString();
		var gain = main.gain[this._note];

		this.freqLabel.text(this._note.freq.toFixed(2));
		this.noteLabel.text(noteName);
		this.noteRange.value = this._note.index;
		this.gainLabel.text(gain.toFixed(2));
		this.gainRange.value = gain;
		this.gainRange.disabled = gain == 0;
	}

	setTimeout(function () {
		this.update();
	}.bind(this), 1000.0 / this._updateRate);
};


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