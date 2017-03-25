import {Component, Input, OnInit} from '@angular/core';
import {Bar} from "../../shared/sequencer/bar.model";
import {SequencerNote} from "../../shared/sequencer/sequencernote.model";
import {NoteService} from "../../shared/note/note.service";

class BarNote {
  x: number;
  y: number;
  filePath: string;
  note: SequencerNote;

  constructor(note, x, y, filePath) {
    this.note = note;
    this.x = x;
    this.y = y;
    this.filePath = filePath;
  }
}

@Component({
  selector: 'div[app-bar]',
  templateUrl: './sequencer-bar.component.html',
  styleUrls: ['./sequencer-bar.component.css']
})
export class SequencerBarComponent implements OnInit {
  @Input() state: Bar;
  @Input() notes: SequencerNote[];

  readonly LineDistance = 12;
  readonly ZeroLineY = 100;
  readonly LinesCount = 5;
  linesY = [];

  /**
   * Key - note id
   * Value - number of line (
   */
  notePositons: Map<number, number> = new Map();

  //
  // Key - offset
  // Value - number of additional lines
  //
  additionalLinesUp: number[] = [];
  additionalLinesDown: number[] = [];

  offsets: number[] = this.range(32);

  constructor(private noteService: NoteService) {
    for (let i = 0; i < this.LinesCount; i++) {
      this.linesY[i] = this.ZeroLineY - this.LineDistance * i;
    }
    for (let i = 0; i < 32; i++) {
      this.additionalLinesUp[i] = 0;
      this.additionalLinesDown[i] = 0
    }
  }

  ngOnInit() {
    let E3index = this.noteService.E3index,
      baseNotes = this.noteService.notes, //hack to speed up processing
      diffCur,
      addLinesUp = this.additionalLinesUp,
      addLinesDown = this.additionalLinesDown;

    for (let note of this.notes) {
      diffCur = baseNotes[note.baseNoteId].index - E3index;
      if (diffCur < 0
        && (-diffCur / 2 > addLinesDown[note.position.offset])) {
        addLinesDown[note.position.offset] = -Math.floor(diffCur / 2);
      }
      diffCur -= this.LinesCount * 2;
      if (diffCur > 0
        && (diffCur / 2 > addLinesUp[note.position.offset])) {
        addLinesUp[note.position.offset] = Math.floor(diffCur / 2);
      }
    }
  }

  private range(n: number): number[] {
    return Array.from(new Array(n), (x, i) => i + 1)
  }
}
