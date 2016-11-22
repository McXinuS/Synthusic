// TODO: enable multitouch

exports.Keyboard = Keyboard;

function Keyboard(container) {
	let eventNote;
	let eventKey;

	for (let i = 0; i < __constants.NOTES_COUNT; i++) {
		let note = __note.getNote(i);
		let key = document.createElement('div');
		key.classList.add('key');
		key.classList.add(note.isAccidental ? 'key-black' : 'key-white');
		key.setAttribute('name', note.name);
		key.setAttribute('oct', note.octave);
		key.setAttribute('data-toggle', 'tooltip');
		key.setAttribute('data-placement', 'top');
		key.setAttribute('title', note.name + note.octave);

		key.oncontextmenu = function (e) {
			return false;
		};
		key.onmousedown = function (e) {
			eventNote = __note.getNote(e.target.getAttribute('name'), e.target.getAttribute('oct'));

			if (e.button == 2) {
				eventKey = document.querySelector('[name="' + eventNote.name + '"][oct="' + eventNote.octave + '"]');
				eventKey.classList.add('selected');
			}
			if (e.button != 1) {
				main.playing[eventNote] ?
					main.stopNote({note: eventNote}) : main.playNote({note: eventNote});
			}
			main.observeInNoteBox(eventNote);
		};
		key.onmouseup = function (e) {
			if (e.button == 2) {
				main.stopNote({note: eventNote});
				eventKey.classList.remove('selected');
			}
		};

		container.appendChild(key);
	}

	let keyboardOverlay = document.getElementById('keyboard-up');
	keyboardOverlay.style.width = container.scrollWidth + 'px';
}

Keyboard.prototype.destroy = function () {
	let container = document.getElementById("keyboard");
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};

// set highlight on key
Keyboard.prototype.highlightOn = function (note) {
	let el = document.querySelector('[name="' + note.name + '"][oct="' + note.octave + '"]');
	if (el) el.classList.add('playing');
};

// remove highlight on key
Keyboard.prototype.highlightOff = function (note) {
	let el = document.querySelector('[name="' + note.name + '"][oct="' + note.octave + '"]');
	if (el) el.classList.remove('playing');
};

// remove all highlights
Keyboard.prototype.highlightClear = function () {
	for (let i = 0; i < __constants.NOTES_COUNT; i++) {
		let note = __note.getNote(i);
		let el = document.querySelector('[name="' + note.name + '"][oct="' + note.octave + '"]');
		if (el) el.classList.remove('playing');
	}
};
