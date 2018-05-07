import {Component, Input, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import {BaseNote} from '@core/models';
import {KeyChangeMode} from './key-change-mode.enum';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-keyboard-key',
  templateUrl: './key.component.html',
  styleUrls: ['./key.component.css']
})
export class KeyComponent {
  @Input() note: BaseNote;
  @Input() highlighted: boolean;
  @Input() selected: boolean = false;
  @Output() keyStateUpdated = new EventEmitter();

  onContextMenu() {
    return false;
  }

  onMouseDown(e: MouseEvent) {
    if (e.buttons == 2) {
      this.selected = true;
      this.playNote();
    }
    if (e.buttons == 1) {
      this.highlighted ? this.stopNote() : this.playNote();
    }
    if (e.buttons == 1 || e.buttons == 4) {
      // disable scroll on mouse wheel click and text selection when dragging
      return false;
    }
  }

  onMouseEnter(e: MouseEvent) {
    if (e.buttons == 2) this.selected = true;
    if (e.buttons == 1 || e.buttons == 2) this.playNote();
  }

  onMouseLeave(e: MouseEvent) {
    if (e.buttons == 1 || e.buttons == 2) this.stopNote();
  }

  onMouseUp(e: MouseEvent) {
    if (e.buttons == 2) this.stopNote();
  }


  playNote() {
    this.keyStateUpdated.emit({mode: KeyChangeMode.play, note: this.note});
  }

  stopNote() {
    this.selected = false;
    this.keyStateUpdated.emit({mode: KeyChangeMode.stop, note: this.note});
  }
}
