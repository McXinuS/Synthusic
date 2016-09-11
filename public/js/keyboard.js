function Keyboard(container) {
	
	var eventNote;
	var eventKey;

	for (var i = 0; i < notesCount; i++) {
		var note = getNote(i);
		var key = document.createElement('div');
		key.classList.add('key');
		key.classList.add(note.isAccidental ? 'key-black' : 'key-white');
		key.setAttribute('name', note.name);
		key.setAttribute('oct', note.octave);
		key.setAttribute('data-toggle', 'tooltip');
		key.setAttribute('data-placement', 'top');
		key.setAttribute('title', note.name+note.octave);
		key.oncontextmenu = function (e) {
			return false;
		};
		key.onmousedown = function (e) {
			eventNote = getNote(e.target.getAttribute('name'), e.target.getAttribute('oct'));
			playing[eventNote.index] ? stopNote(eventNote) : playNote(eventNote);
			if (e.button == 2) {
				eventKey = document.querySelector('[name="' + eventNote.name + '"][oct="' + eventNote.octave + '"]');
				eventKey.classList.add('selected');
			}
			updateNoteBox(eventNote);
		};
		key.onmouseup = function (e) {
			if (e.button == 2) {
				stopNote(eventNote);
				eventKey.classList.remove('selected');
			}
		};
		
		container.appendChild(key);
	}

	var keyboardOverlay = document.getElementById('keyboard-up');
	keyboardOverlay.style.width = container.scrollWidth + 'px';
}

Keyboard.prototype.destroy = function () {
	var container = document.getElementById("keyboard");
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};

// set highlight on key
Keyboard.prototype.highlightOn = function (note) {
	var el = document.querySelector('[name="' + note.name + '"][oct="' + note.octave + '"]');
	if (el)
		el.classList.add('playing');
};

// remove highlight on key
Keyboard.prototype.highlightOff = function (note) {
	var el = document.querySelector('[name="' + note.name + '"][oct="' + note.octave + '"]');
	if (el)
		el.classList.remove('playing');
};

// remove all highlights
Keyboard.prototype.highlightClear = function () {
	for (var i=0; i<notesCount; i++) {
		var note = getNote(i);
		var el = document.querySelector('[name="' + note.name + '"][oct="' + note.octave + '"]');
		if (el)
			el.classList.remove('playing');
	}
};
