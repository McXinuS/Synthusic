import {Component, OnInit, Input} from '@angular/core';
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

  private getNote(): SequencerNote {

    const formValue = this.form.value;

    // Convert number string values to integer.
    const parsedValue = {
      id: parseInt(formValue.id),
      baseNoteId: parseInt(formValue.baseNoteId),
      instrumentId: parseInt(formValue.instrumentId),
      duration: {
        baseDuration: parseInt(formValue.duration.baseDuration)
      },
      position: {
        bar: parseInt(formValue.position.bar),
        offset: parseInt(formValue.position.offset)
      }
    };

    return {...formValue, ...parsedValue};
  }

  onSubmit() {
    if (this.form.valid) {
      let note = this.getNote();
      this.sequencerService.updateNote(note);
      this.close();
    }
  }

  remove() {
    let note = this.getNote();
    this.sequencerService.removeNote(note.id);
    this.close();
  }

  close() {
    this.sequencerService.hideNoteSettings();
  }
}
