import { Component, OnInit, Input } from '@angular/core';
import {BaseNote, Instrument, SequencerNoteSettingsState} from "@core/models";
import {InstrumentService, NoteService, SequencerService} from "@core/services";
import {Observable} from "rxjs/Observable";
import {NoteDurationEnum} from "@shared-global/models/sequencer-note.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SequencerNote} from "@shared-global/models";

@Component({
  selector: 'app-note-settings',
  templateUrl: './note-settings.component.html',
  styleUrls: ['./note-settings.component.css']
})
export class NoteSettingsComponent implements OnInit {

  @Input() state: SequencerNoteSettingsState;

  noteDurationEnum = NoteDurationEnum;
  instruments$: Observable<Array<Instrument>>;
  notes: BaseNote[];

  form: FormGroup;

  constructor(private sequencerService: SequencerService,
              private instrumentService: InstrumentService,
              private noteService: NoteService) {
    this.instruments$ = this.instrumentService.instruments$;
    this.notes = this.noteService.notes;
  }

  ngOnInit() {
    this.form = new FormGroup({
      id: new FormControl(this.state.note.id),

      baseNoteId: new FormControl(this.state.note.baseNoteId),
      instrumentId: new FormControl(this.state.note.instrumentId),
      isRest: new FormControl(this.state.note.isRest),

      duration: new FormGroup({
        baseDuration: new FormControl(this.state.note.duration.baseDuration, Validators.required),
        dotted: new FormControl(this.state.note.duration.dotted, Validators.required),
        triplet: new FormControl(this.state.note.duration.triplet, Validators.required),
      }),

      position: new FormGroup({
        bar: new FormControl(this.state.note.position.bar, Validators.required),
        offset: new FormControl(this.state.note.position.offset, Validators.required),
      }),
    });
  }

  onSubmit() {
    if (this.form.valid) {

      const formValue = this.form.value;
      let note: SequencerNote = formValue;

      note.id = parseInt(formValue.id);
      note.baseNoteId = parseInt(formValue.baseNoteId);
      note.instrumentId = parseInt(formValue.instrumentId);
      note.duration.baseDuration = parseInt(formValue.duration.baseDuration);
      note.position.bar = parseInt(formValue.position.bar);
      note.position.offset = parseInt(formValue.position.offset);
      
      this.sequencerService.updateNote(note);
    }
  }

  close() {
    this.sequencerService.hideNoteSettings();
  }
}
