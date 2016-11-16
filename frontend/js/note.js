exports.Note = Note;
exports.getNote = getNote;

let noteCache = [];

function Note(name, octave) {
	this.name = name.toUpperCase();
	this.octave = octave;
	this.isAccidental = (this.name[1] && (this.name[1] === '♭' || this.name[1] === '♯'));
	this.freq = getFrequency(this.name, octave);

	this.__defineGetter__("index", function () {
		return getIndex(this.name, this.octave);
	});

	this.toString = function () {
		return this.name + this.octave;
	}
}

// get note by index OR by name+octave
// from cache or create one
function getNote(name, octave) {
	let index;
	if (arguments.length == 1) {
		index = name;
	} else {
		index = getIndex(name, octave);
	}

	if (noteCache[index])
		return noteCache[index];

	let note;
	if (arguments.length == 1) {
		let oct = __config.NOTE_START.octave +
			Math.floor((index + __config.ACCIDENTAL.indexOf(__config.NOTE_START.name)) / __config.ACCIDENTAL.length);
		let scaleIndex = __config.ACCIDENTAL.indexOf(__config.NOTE_START.name) + index % __config.ACCIDENTAL.length;
		if (scaleIndex >= __config.ACCIDENTAL.length)
			scaleIndex -= __config.ACCIDENTAL.length;
		let n = __config.ACCIDENTAL[scaleIndex];
		note = new Note(n, oct);
	} else {
		note = new Note(name, octave);
	}

	noteCache[index] = note;
	return note;
}

function getFrequency(name, octave) {
	// interval of each note from 'A' note
	const interval = [];
	interval["C"] = -9;
	interval["D"] = -7;
	interval["E"] = -5;
	interval["F"] = -4;
	interval["G"] = -2;
	interval["A"] = 0;
	interval["B"] = 2;

	let inter = interval[name[0]];

	if (name[1] == '♭')
		inter--;
	if (name[1] == '♯')
		inter++;

	inter = (octave - 4) + inter / 12.0;

	return 440. * Math.pow(2.0, inter);
}

function getIndex(name, octave) {
	return (octave - __config.NOTE_START.octave) * __config.ACCIDENTAL.length -
		__config.ACCIDENTAL.indexOf(__config.NOTE_START.name) + __config.ACCIDENTAL.indexOf(name)
}

__config.NOTE_START = new Note(__config.NOTE_START[0], __config.NOTE_START[1]);
__config.NOTE_END = new Note(__config.NOTE_END[0], __config.NOTE_END[1]);
noteCache[0] = __config.NOTE_START;
noteCache[__config.NOTES_COUNT] = __config.NOTE_END;