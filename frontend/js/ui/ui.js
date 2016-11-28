import {convertToProgressBar, attachDragger, updateDropdownSelection, floatEqual} from './ext.js'
import {NoteBox} from './notebox.js'
import {Oscilloscope} from "./oscilloscope.js";
import {Keyboard}     from "./keyboard.js";
import {PageBackgroundDrawer}     from "./page_background.js";
exports.Ui = Ui;

function Ui() {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    $.fn.attachDragger = attachDragger;

    this.initDom();

    let self = this;

    //this.pageBackgroundDrawer = new PageBackgroundDrawer(this.pageBackground);

    this.oscilloscope = new Oscilloscope(this.oscCanvas);

    this.keyboard = new Keyboard(this.keyboardContainer);

    let update = function () {
        try {
            self.noteBox.update();
            self.updateEnvelopeGain();
            self.updateRms();
        } catch (err) {
            console.warn('Something went wrong during UI update: ' + err.name + ": " + err.message);
        } finally {
            window.requestAnimationFrame(update); // high cpu load
            //setTimeout(update, 50); // throttle fps
        }
    };
    update();
}

Ui.prototype.initDom = function () {

    let self = this;

    this.pageBackground = document.getElementById('background');

    this.settingsContainer = $('#nav_settings');

    this.masterGainRange = document.getElementById('master-gain-range');
    this.masterGainLabel = $('#master-gain-label').find('> span.label-value');
    this.masterGainRange.setAttribute("max", __constants.MASTER_GAIN_MAX);

    this.instrumentList = $('#instr-list');
    this.instrumentListLabel = this.instrumentList.find('> button');
    var instrItems = this.instrumentList.find('ul');
    for (var index in __config.instruments) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.setAttribute('href', '#');
        a.setAttribute('data', __config.instruments[index].id);
        a.innerText = __config.instruments[index].name;
        li.appendChild(a);
        instrItems.append(li);
    }
    this.instrumentListDropdown = this.instrumentList.find("> .dropdown-menu");
    this.instrumentListItems = this.instrumentListDropdown[0].getElementsByTagName('li');
    this.instrumentListDropdown.on("click", "li", function (event) {
        main.instrument = event.target.getAttribute('data');
    });

    this.envelopeConfigElements = {};
    let envTypes = ['attack', 'decay', 'sustain', 'release'];
    for (let ind in envTypes) {
        let envType = envTypes[ind];
        this.envelopeConfigElements[envType + 'Label'] = $('#envelope-' + envType + '-label').find('> span.label-value');
        this.envelopeConfigElements[envType + 'Range'] = document.getElementById('envelope-' + envType + '-range');
        this.updateEnvelopeConfig(__config.envelope[envType], envType);
    }

    this.bpmRange = document.getElementById('bpm-range');
    this.bpmLabel = $('#bpm-label').find('> span.label-value');
    this.muteButton = document.getElementById("mute-btn");

    this.envelopeGainLabel = $('#envelope-label').find('> span.label-value');
    this.envelopeGainRange = document.getElementById("envelope-gain-range");
    convertToProgressBar(this.envelopeGainRange, '#4a4');
    this.rmsLabel = $('#rms-label').find('> span.label-value');
    this.rmsRange = document.getElementById("rms-range");
    convertToProgressBar(this.rmsRange, ['#4a4', '#ff4', '#f44'], [50, 80, 100]);

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
    this.keyboardContainer = document.getElementById("keyboard-keys");

    $("#keyboard-up").attachDragger($("#keyboard"));

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });
};

Ui.prototype.showNav = function (nav) {
    this.settingsContainer.slideToggle();
};

Ui.prototype.closeNav = function () {
};

Ui.prototype.updateEnvelopeConfig = function (value, type) {
    //if (floatEqual(value, __config.envelope[type], 1e-2)) return;
    this.envelopeConfigElements[type + 'Range'].value = value;
    this.envelopeConfigElements[type + 'Label'].text(value.toFixed());
};

Ui.prototype.updateEnvelopeGain = function () {
    let gain = main.sound.enveloper.getGain();
    if (floatEqual(gain, this.envelopeGainRange.value, 1e-3)) return;
    this.envelopeGainRange.value = gain;
    this.envelopeGainRange.onchange();
    this.envelopeGainLabel.text(gain.toFixed(3));
};

Ui.prototype.updateRms = function () {
    let rms = main.sound.analyser.getRms();
    if (floatEqual(rms, parseFloat(this.rmsRange.value), 1e-3)) return;
    this.rmsRange.value = rms;
    this.rmsRange.onchange();
    this.rmsLabel.text(rms.toFixed(3));
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
    updateDropdownSelection(value.id, this.instrumentListItems, 'data');
};

Ui.prototype.updateOscilloscopeRenderType = function (value) {
    updateDropdownSelection(value, this.renderTypeListItems, 'data');
};
