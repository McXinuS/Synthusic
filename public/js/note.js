// TODO wrap it in a class

var scale;
var noteFirst;
var noteLast;
var notesCount;
var noteCache = [];

function Note(name, octave) {
	this.name = name.toUpperCase();
	this.octave = octave;
	this.isAccidental = (this.name[1] && (this.name[1] === '♭' || this.name[1] === '♯'));
	this.freq = getFrequency(this.name, octave);

	this.__defineGetter__("index", function () {
		return getIndex(this.name, this.octave);
	});

	this.toString = function() {
		return this.name + this.octave;
	}
}

function noteLibInit(nameFirst, octFirst, nameLast, octLast, sc) {
	scale = sc;
	noteFirst = new Note(nameFirst, octFirst);
	noteLast = new Note(nameLast, octLast);
	notesCount = getNotesCount(noteFirst, noteLast);
	noteCache[0] = noteFirst;
	noteCache[notesCount-1] = noteLast;
}

function getFrequency(name, octave) {
	// interval of each note from 'A' note
	var interval = [];
	interval["C"] = -9;
	interval["D"] = -7;
	interval["E"] = -5;
	interval["F"] = -4;
	interval["G"] = -2;
	interval["A"] = 0;
	interval["B"] = 2;
	
	var inter = interval[name[0]];
	
	if (name[1] == '♭')
		inter--;
	if (name[1] == '♯')
		inter++;
	
	inter = (octave - 4) + inter / 12.0;
	
	return 440. * Math.pow(2.0, inter);
}

function getIndex(name, octave) {
	return (octave - noteFirst.octave) * scale.length - scale.indexOf(noteFirst.name) + scale.indexOf(name)
}

// get note by index OR by name+octave
// from cache or create one
function getNote(name, octave) {
	var index;
	if (arguments.length == 1) {
		index = name;
	} else {
		index = getIndex(name, octave);
	}

	if (noteCache[index])
		return noteCache[index];

	var note;
	if (arguments.length == 1) {
		var o = noteFirst.octave + Math.floor((index + scale.indexOf(noteFirst.name)) / scale.length);
		var scaleIndex = scale.indexOf(noteFirst.name) + index % scale.length;
		if (scaleIndex >= scale.length)
			scaleIndex -= scale.length;
		var n = scale[scaleIndex];
		note = new Note(n, o);
	} else {
		note = new Note(name, octave);
	}

	noteCache[index] = note;
	return note;
}

// number of notes in range of 2 notes
function getNotesCount(noteFrom, noteTo) {
	return (noteTo.octave - noteFrom.octave) * scale.length
		- scale.indexOf(noteFrom.name) + scale.indexOf(noteTo.name) + 1;
}