import {Component, Input, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import {Note} from "../../shared/note/note.model";
import {KeyChangeMode} from "./keychangemode.enum";

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-keyboard-key',
  templateUrl: './key.component.html',
  styleUrls: ['./key.component.css']
})
export class KeyComponent {
  @Input() note: Note;
  @Input() highlighted: boolean;
  selected: boolean = false;
  @Output() keyStateUpdated = new EventEmitter();

  onMouseDown(e) {
    if (e.which == 3) {
      this.selected = true;
      this.playNote();
    }
    if (e.which == 1) {
      this.highlighted ? this.stopNote() : this.playNote();
    }
    if (e.which == 1 || e.which == 2) {
      // disable scroll on mouse wheel click and text selection when dragging
      return false;
    }
  }

  onMouseEnter(e) {
    if (e.which == 0) return;

    if (e.which == 3) this.selected = true;
    if (e.which == 1 || e.which == 3) this.playNote();
  }

  onMouseLeave(e) {
    if (e.which == 0) return;

    if (e.which == 1 || e.which == 3) this.stopNote();
  }

  onMouseUp(e) {
    if (e.which == 3) this.stopNote();
  }

  onContextMenu() {
    return false;
  }

  playNote() {
    this.keyStateUpdated.emit({mode: KeyChangeMode.play, note: this.note});
  }

  stopNote() {
    this.selected = false;
    this.keyStateUpdated.emit({mode: KeyChangeMode.stop, note: this.note});
  }
}
