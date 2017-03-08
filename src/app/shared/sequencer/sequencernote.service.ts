import {Injectable} from "@angular/core";
import {SequencerNote} from "./sequencernote.model";
import {Instrument} from "../instrument/instrument.model";
import {Note} from "../note/note.model";
import {InstrumentService} from "../instrument/instrument.service";
import {NoteService} from "../note/note.service";

@Injectable()
export class SequencerNoteService {
  readonly ID_INSTRUMENT_MULTIPLIER = 200;

  constructor(private noteService: NoteService, private instrumentService: InstrumentService) {
  }

  getSequencerNote(note: Note, instrument: Instrument): SequencerNote;
  getSequencerNote(id: number): SequencerNote;
  getSequencerNote(noteOrId: any, instrument?: Instrument): SequencerNote {
    // may be hash them?
    return this.Create(noteOrId, instrument);
  }

  private Create(note: Note, instrument: Instrument): SequencerNote;
  private Create(id: number): SequencerNote;
  private Create(noteOrId: any, instrument?: Instrument): SequencerNote {
    if (typeof noteOrId == 'number') {
      let [noteId, insId] = this.parseID(noteOrId);
      let n = this.noteService.getNote(noteId);
      let i = this.instrumentService.getInstrument(insId);
      return new SequencerNote(noteOrId, n, i);
    } else if (noteOrId instanceof Note) {
      return new SequencerNote(this.getID(noteOrId, instrument), noteOrId, instrument);
    } else {
      throw new Error('Wrong argument type');
    }
  }

  private getID(note: Note, instrument: Instrument) {
    return this.getPrefix(instrument.id) + note.index;
  }

  private parseID(id: number) {
    return [id % this.ID_INSTRUMENT_MULTIPLIER, Math.trunc(id / this.ID_INSTRUMENT_MULTIPLIER)];
  }

  getPrefix(instrumentId: number): number {
    return instrumentId * this.ID_INSTRUMENT_MULTIPLIER;
  }

  /**
   * Checks whether the sequencerNote contains following instrument.
   */
  hasInstrumentPreffix(instrumentId: number, sequencerNoteId: number): boolean {
    return instrumentId == sequencerNoteId % this.ID_INSTRUMENT_MULTIPLIER;
  }
}
