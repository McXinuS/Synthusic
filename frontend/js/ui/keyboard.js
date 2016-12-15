// TODO enable multitouch

exports.Keyboard = Keyboard;

function Keyboard(container) {
    let mouseDown = false;
    let mouseLeaveTimeout = -1;

    for (let i = 0; i < __constants.NOTES_COUNT; i++) {
        let note = __note.getNote(i);
        let key = document.createElement('div');
        key.classList.add('key');
        key.classList.add(note.isAccidental ? 'key-black' : 'key-white');
        key.setAttribute('name', note.fullname);
        key.setAttribute('data-toggle', 'tooltip');
        key.setAttribute('data-placement', 'top');
        key.setAttribute('title', note.fullname);

        let eventNote = __note.getNote(key.getAttribute('name'));

        key.onmousedown = function (e) {
            mouseDown = true;

            if (e.button == 2) {
                key.classList.add('selected');
            }

            if (e.button == 0 || e.button == 2) {
                main.playing[eventNote] ?
                    main.stopNote({note: eventNote}) : main.playNote({note: eventNote});
            }

            main.observeInNoteBox(eventNote);

            if (e.button == 1) {
                return false;
            }
        };

        key.onmouseenter = function (e) {
            if (!mouseDown) return;

            clearTimeout(mouseLeaveTimeout);
            if (e.button == 0 || e.button == 2) main.playNote({note: eventNote});
            if (e.button == 2) key.classList.add('selected');
            main.observeInNoteBox(eventNote);
        };

        key.onmouseleave = function (e) {
            if (!mouseDown) return;

            if (e.button == 0 || e.button == 2) main.stopNote({note: eventNote});
            mouseLeaveTimeout = setTimeout(()=>{mouseDown = false;}, 250);
        };

        key.onmouseup = function (e) {
            mouseDown = false;
            if (e.button == 2) main.stopNote({note: eventNote});
        };

        key.oncontextmenu = function (e) {
            return false;
        };

        container.appendChild(key);
    }

    let keyboardOverlay = document.getElementById('keyboard-up');
    keyboardOverlay.style.width = container.scrollWidth + 'px';
    window.addEventListener('resize', function () {
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
    if (el && !el.classList.contains('selected')) {
        el.classList.add('playing');
    }
};

// remove highlight on key
Keyboard.prototype.highlightOff = function (note) {
    let el = document.querySelector(`[name="${note.fullname}"]`);
    if (el) {
        el.classList.remove('playing');
        el.classList.remove('selected');
    }
};

// remove all highlights
Keyboard.prototype.highlightClear = function () {
    for (let i = 0; i < __constants.NOTES_COUNT; i++) {
        let note = __note.getNote(i);
        let el = document.querySelector(`[name="${note.fullname}"]`);
        if (el) el.classList.remove('playing');
    }
};
