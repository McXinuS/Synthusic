import {Component, Input, OnInit} from '@angular/core';
import {Bar} from "../../../shared/sequencer/bar.model";
import {SequencerNote} from "../../../shared/sequencer/sequencernote.model";
import {NoteService} from "../../../shared/note/note.service";

@Component({
  selector: 'div[app-bar]',
  templateUrl: './sequencer-bar.component.html',
  styleUrls: ['./sequencer-bar.component.css']
})
export class SequencerBarComponent implements OnInit {
  @Input() state: Bar;
  @Input() notes: SequencerNote[];

  // readonly LinesCount = 5;

  // e3id: number; // index of 'E3' note

  constructor(/*private noteService: NoteService*/) {
  }

  ngOnInit() {
    /*
    this.e3id = this.noteService.getNote('e3').id;

    for (let note of this.notes) {
      diffCur = note.baseNoteId - e3id;
      if (diffCur < 0 &&
        (-diffCur / 2 > this.addLinesDown)) {
        this.addLinesDown = -Math.floor(diffCur / 2);
      } else if (diffCur > this.LinesCount * 2 &&
        ((diffCur - this.LinesCount * 2) / 2 > this.addLinesUp)) {
        this.addLinesUp = Math.floor((diffCur - this.LinesCount * 2) / 2);
      }
    }
    */
  }
}
