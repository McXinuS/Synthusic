import {floatEqual} from '../ext.js'

exports.NoteBox = NoteBox;

function NoteBox(parameters) {
    this.noteRange = parameters.noteRange;
    this.noteLabel = parameters.noteLabel;
    this.freqLabel = parameters.freqLabel;
    this.gainRange = parameters.gainRange;
    this.gainLabel = parameters.gainLabel;
    if (typeof(parameters.onGainChange) == 'function') {
        this.onGainChange = parameters.onGainChange;
    }

    this.noteRange.setAttribute("min", "0");
    this.noteRange.setAttribute("max", (__constants.NOTES_COUNT-1).toString());

    this._note = undefined;
}

NoteBox.prototype.setObserve = function (note) {
    this._note = note;
};

// display info about selected note in the 'note-info' div
NoteBox.prototype.update = function () {
    if (typeof(this._note) === 'undefined')return;

    let noteName = this._note.toString();
    let gain = main.gain[this._note];

    if (this.noteRange.value == this._note.index && floatEqual(gain, this.gainRange.value, 1e-2)) return;

    this.freqLabel.text(this._note.freq.toFixed(2));
    this.noteLabel.text(noteName);
    this.noteRange.value = this._note.index;
    this.gainLabel.text(gain.toFixed(2));
    this.gainRange.value = gain;
    this.gainRange.disabled = main.playing[this._note] !== true;
};