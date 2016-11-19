exports.Note = Note;
exports.getNote = getNote;

let noteCache = [];
__constants.NOTES_COUNT = (__constants.NOTE_END[1] - __constants.NOTE_START[1]) * __config.scale.length
- __config.scale.indexOf(__constants.NOTE_START[0]) + __config.scale.indexOf(__constants.NOTE_END[0]) + 1;

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
		let oct = __constants.NOTE_START.octave +
			Math.floor((index + __config.scale.indexOf(__constants.NOTE_START.name)) / __config.scale.length);
		let scaleIndex = __config.scale.indexOf(__constants.NOTE_START.name) + index % __config.scale.length;
		if (scaleIndex >= __config.scale.length)
			scaleIndex -= __config.scale.length;
		let n = __config.scale[scaleIndex];
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
	return (octave - __constants.NOTE_START.octave) * __config.scale.length -
		__config.scale.indexOf(__constants.NOTE_START.name) + __config.scale.indexOf(name)
}

__constants.NOTE_START = new Note(__constants.NOTE_START[0], __constants.NOTE_START[1]);
__constants.NOTE_END = new Note(__constants.NOTE_END[0], __constants.NOTE_END[1]);
noteCache[0] = __constants.NOTE_START;
noteCache[__constants.NOTES_COUNT] = __constants.NOTE_END;