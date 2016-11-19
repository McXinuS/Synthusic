import {NoteBox} from './notebox.js'
exports.Ui = Ui;

/*
 // Settings
 var masterGainLabel, masterGainRange,
    instrumentListLabel, instrumentList,
    bpmLabel, bpmRange;
 // Note box
 var noteInfoFreq, noteInfoNote,
    noteInfoGainLabel, noteInfoGainRange,
    noteInfoNoteRange;
 */
function Ui() {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    this.initDom();
}

Ui.prototype.initDom = function () {

    let self = this;

    this.masterGainRange = document.getElementById('master-gain-range');
    this.masterGainLabel = $('div.master-gain > span.label-value');
    this.masterGainRange.setAttribute("max", __config.MASTER_GAIN_MAX.toString());

    this.instrumentList = $('#instr-list');
    this.instrumentListLabel = this.instrumentList.find('> button');
    var instrItems = this.instrumentList.find('ul');
    for (var index in __config.INSTRUMENTS) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.setAttribute('href', '#');
        a.innerText = __config.INSTRUMENTS[index].name;
        li.appendChild(a);
        instrItems.append(li);
    }
    this.instrumentList.find("> .dropdown-menu").on("click", "li", function (event) {
        main.instrument = event.target.innerHTML;
    });

    this.bpmRange = document.getElementById('bpm-range');
    this.bpmLabel = $('#bpm-label').find('> span.label-value');
    this.muteButton = document.getElementById("mute-btn");

	this.envelopeGain = $('#envelope-label').find('> span.label-value');
	this.envelopeGainRange = document.getElementById("envelope-gain-range");

    this.noteInfoNoteRange = document.getElementById("note-info-note-range");
    this.noteInfoFreq = $('div.freq > span.label-value');
    this.noteInfoNote = $('div.note > span.label-value');
    this.noteInfoGainRange = document.getElementById("note-info-gain-range");
    this.noteInfoGainLabel = $('div.gain > span.label-value');

    this.noteBox = new NoteBox({
        noteRange: this.noteInfoNoteRange,
        noteLabel: this.noteInfoNote,
        freqLabel: this.noteInfoFreq,
        gainRange: this.noteInfoGainRange,
        gainLabel: this.noteInfoGainLabel
    });
    this.noteInfoGainRange.oninput = function () {
        var n = __note.getNote(self.noteInfoNoteRange.value);
        main.gain[n] = self.noteInfoGainRange.value;
    };

	var setTitle = document.getElementById('settings').getElementsByClassName('container-title')[0];
	setTitle.onclick = function () {
		$('#settings-arrow').toggleClass('glyphicon-collapse-up glyphicon-collapse-down');
	};

	var stateTitle = document.getElementById('state-container').getElementsByClassName('container-title')[0];
	stateTitle.onclick = function () {
		$('#state-arrow').toggleClass('glyphicon-collapse-up glyphicon-collapse-down');
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

	let update = function () {
        self.noteBox.update();
        self.updateEnvelopeGain();

	    window.requestAnimationFrame(update);
	};
	update();
};

Ui.prototype.updateEnvelopeGain = function() {
    if (typeof(main.sound) === 'undefined') return;

    let gain = main.sound.enveloper.getGain().toFixed(3);
	this.envelopeGainRange.value = gain;
	this.envelopeGain.text(gain);
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