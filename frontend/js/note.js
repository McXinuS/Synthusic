exports.Note = Note;
exports.getNote = getNote;

let noteCache = [];
__constants.NOTES_COUNT = (__constants.NOTE_END[1] - __constants.NOTE_START[1]) * __config.scale.length
    - __config.scale.indexOf(__constants.NOTE_START[0]) + __config.scale.indexOf(__constants.NOTE_END[0]) + 1;
noteCache[0] = __constants.NOTE_START = new Note(__constants.NOTE_START[0] + __constants.NOTE_START[1]);
noteCache[__constants.NOTES_COUNT] = __constants.NOTE_END = new Note(__constants.NOTE_END[0] + __constants.NOTE_END[1]);

// initialize cache
for (let i = 1; i < __constants.NOTES_COUNT - 1; i++) {
    getNote(i);
}

/**
 * Represents a musical note. Contains the following attributes:
 * name, octave, full name, frequency and index in the current synthesizer state.
 */
function Note(fullname) {
    if (typeof(fullname) !== 'string')
        throw new Error('Parameter must be a string.');

    fullname = fullname.toUpperCase();
    let no = parseNoteFullName(fullname);

    const _name = no[0];
    const _octave = no[1];
    const _fullname = fullname;
    const _isAccidental = (_name[1] && (_name[1] === '♭' || _name[1] === '♯'));
    const _freq = getFrequency(_name, _octave);
    const _index = getIndex(_name, _octave);

    Object.defineProperties(this, {
        name: {
            get: () => {
                return _name;
            }
        },
        octave: {
            get: () => {
                return _octave;
            }
        },
        fullname: {
            get: () => {
                return _fullname;
            }
        },
        isAccidental: {
            get: () => {
                return _isAccidental;
            }
        },
        freq: {
            get: () => {
                return _freq;
            }
        },
        index: {
            get: () => {
                return _index;
            }
        },
        toString: {
            value: function () {
                return _fullname;
            },
            enumerable: false
        }
    });
}

/**
 * Get a note by index or fullname.
 * @param note Index, fullname
 */
function getNote(note) {
    let index;

    if (typeof(note) === 'string') {
        let no = parseNoteFullName(note);
        index = getIndex(no[0], no[1]);
    } else {
        index = note;
    }

    if (noteCache[index])
        return noteCache[index];

    let resNote;

    if (typeof(note) === 'string') {
        resNote = new Note(note);
    } else {
        index = note;
        let oct = __constants.NOTE_START.octave +
            Math.floor((index + __config.scale.indexOf(__constants.NOTE_START.name)) / __config.scale.length);
        let scaleIndex = __config.scale.indexOf(__constants.NOTE_START.name) + index % __config.scale.length;
        if (scaleIndex >= __config.scale.length)
            scaleIndex -= __config.scale.length;
        let name = __config.scale[scaleIndex];
        resNote = new Note(name + oct);
    }

    noteCache[index] = resNote;
    return resNote;
}

/**
 * Split note's full name into name and octave.
 * @returns {Array} Array with name and octave.
 */
function parseNoteFullName(fullname) {
    let res = [];
    if (fullname.length == 2) {
        res[0] = fullname[0];
        res[1] = parseFloat(fullname[1]);
    } else if (fullname.length == 3) {
        res[0] = fullname.substr(0, 2);
        res[1] = parseFloat(fullname[2]);
    } else {
        throw new Error('Wrong full name length.');
    }

    if (isNaN(res[1]))
        throw new Error('Octave must be a number.');

    return res;
}

function getFrequency(name, octave) {
    // interval of each note from 'A' note
    const interval = {
        'C': -9,
        'D': -7,
        'E': -5,
        'F': -4,
        'G': -2,
        'A': 0,
        'B': 2,
    };

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