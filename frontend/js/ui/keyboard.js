// TODO enable multitouch
// TODO play note by note when the keyboard is swiped

exports.Keyboard = Keyboard;

function Keyboard(container) {
    let eventNote;
    let eventKey;

    for (let i = 0; i < __constants.NOTES_COUNT; i++) {
        let note = __note.getNote(i);
        let key = document.createElement('div');
        key.classList.add('key');
        key.classList.add(note.isAccidental ? 'key-black' : 'key-white');
        key.setAttribute('name', note.fullname);
        key.setAttribute('data-toggle', 'tooltip');
        key.setAttribute('data-placement', 'top');
        key.setAttribute('title', note.toString());

        key.oncontextmenu = function (e) {
            return false;
        };
        key.onmousedown = function (e) {
            eventNote = __note.getNote(e.target.getAttribute('name'));

            if (e.button == 2) {
                eventKey = document.querySelector(`[name="${eventNote.toString()}"]`);
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
    window.addEventListener('resize', function () {
        console.log()
        keyboardOverlay.style.width = container.scrollWidth + 'px';
    }.bind(this), true);
}

Keyboard.prototype.destroy = function () {
    let container = document.getElementById("keyboard");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

// set highlight on key
Keyboard.prototype.highlightOn = function (note) {
    let el = document.querySelector(`[name="${note.fullname}"]`);
    if (el) el.classList.add('playing');
};

// remove highlight on key
Keyboard.prototype.highlightOff = function (note) {
    let el = document.querySelector(`[name="${note.fullname}"]`);
    if (el) el.classList.remove('playing');
};

// remove all highlights
Keyboard.prototype.highlightClear = function () {
    for (let i = 0; i < __constants.NOTES_COUNT; i++) {
        let note = __note.getNote(i);
        let el = document.querySelector(`[name="${note.fullname}"]`);
        if (el) el.classList.remove('playing');
    }
};
