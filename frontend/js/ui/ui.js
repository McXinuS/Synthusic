import {NoteBox} from './notebox.js'
import {convertToProgressBar, attachKeyboardDragger, updateDropdownSelection} from './ext.js'
exports.Ui = Ui;

function Ui() {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    $.fn.attachKeyboardDragger = attachKeyboardDragger;

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
    this.instrumentListDropdown = this.instrumentList.find("> .dropdown-menu");
    this.instrumentListItems = this.instrumentListDropdown[0].getElementsByTagName('li');
    this.instrumentListDropdown.on("click", "li", function (event) {
        main.instrument = event.target.innerHTML;
    });

    this.bpmRange = document.getElementById('bpm-range');
    this.bpmLabel = $('#bpm-label').find('> span.label-value');
    this.muteButton = document.getElementById("mute-btn");

    this.envelopeGainLabel = $('#envelope-label').find('> span.label-value');
    this.envelopeGainRange = document.getElementById("envelope-gain-range");
    convertToProgressBar(this.envelopeGainRange, '#4f4');
    this.rmsLabel = $('#rms-label').find('> span.label-value');
    this.rmsRange = document.getElementById("rms-range");
    convertToProgressBar(this.rmsRange, ['#4f4', '#ff4', '#f44'], [50,80,100]);

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

    this.renderTypeList = $('#osc-render-type-list');
    this.renderTypeListLabel = this.renderTypeList.find('> button');
    this.renderTypeListDropdown = this.renderTypeList.find("> .dropdown-menu");
    this.renderTypeListItems = this.renderTypeListDropdown[0].getElementsByTagName('li');
    this.renderTypeListDropdown.on("click", "li", function (event) {
        main.oscilloscopeRenderType = event.target.getAttribute('data');
    });

    this.oscCanvas = document.getElementById('oscilloscope-wrapper').firstElementChild;
    this.keyboardContainer = document.getElementById("keyboard");

    $("#keyboard-up").attachKeyboardDragger();

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });

	let update = function () {
        try{
            self.noteBox.update();
            self.updateEnvelopeGain();
            self.updateRms();
        } catch (err) {
            console.warn('Something went wrong during UI update: ' + err.name + ": " + err.message);
        } finally {
            window.requestAnimationFrame(update);
        }
	};
	update();
};

Ui.prototype.updateEnvelopeGain = function() {
    let gain = main.sound.enveloper.getGain().toFixed(3);
	this.envelopeGainRange.value = gain;
    this.envelopeGainRange.onchange();
	this.envelopeGainLabel.text(gain);
};

Ui.prototype.updateRms = function () {
    let gain = main.sound.analyser.getRms().toFixed(3);
    this.rmsRange.value = gain;
    this.rmsRange.onchange();
    this.rmsLabel.text(gain);
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

Ui.prototype.updateInstrument = function (value) {
    this.instrumentListLabel.html(`Instrument: ${value.name} <span class="caret"></span>`);
    updateDropdownSelection(value.name, this.instrumentListItems);
};

Ui.prototype.updateOscilloscopeRenderType = function (value) {
    updateDropdownSelection(value, this.renderTypeListItems, 'data');
};
