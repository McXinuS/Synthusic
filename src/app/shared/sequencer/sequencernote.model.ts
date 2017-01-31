import {Note} from "../note/note.model";
import {Instrument} from "../instrument/instrument.model";

export class SequencerNote {
  readonly id: number;
  readonly note: Note;
  readonly instrument: Instrument;

  constructor (id: number, note: Note, instrument: Instrument) {
    this.id = id;
    this.note = note;
    this.instrument = instrument;
  }
}
