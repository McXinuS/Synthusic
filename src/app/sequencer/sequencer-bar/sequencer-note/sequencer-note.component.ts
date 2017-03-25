import {Component, Input, OnInit} from '@angular/core';
import {NoteDurationEnum, SequencerNote} from "../../../shared/sequencer/sequencernote.model";
import {NoteService} from "../../../shared/note/note.service";

@Component({
  selector: 'g[app-note]',
  templateUrl: './sequencer-note.component.html',
  styleUrls: ['./sequencer-note.component.css']
})
export class SequencerNoteComponent implements OnInit {
  @Input() note: SequencerNote;

  durations = NoteDurationEnum;

  constructor() { }

  ngOnInit() {
  }

}
