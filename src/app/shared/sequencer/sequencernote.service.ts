import {Injectable} from "@angular/core";
import {SequencerNote, NoteDuration, NotePosition} from "./sequencernote.model";

@Injectable()
export class SequencerNoteService {

  private readonly ID_MULTIPLIER_INSTRUMENT = 200;
  private readonly ID_MULTIPLIER_BASE_NOTE = 1;
  private readonly ID_MULTIPLIER_POSITION = 200;
  private readonly ID_MULTIPLIER_DURATION = 16;

  constructor() {
  }

  getSequencerNote(baseNoteId: number,
                   instrumentId: number,
                   duration?: NoteDuration,
                   position?: NotePosition): SequencerNote {
    // may be hash them?
    if (typeof duration == 'undefined' && typeof position == 'undefined') {
      return this.Create(baseNoteId, instrumentId, NoteDuration.Infinite, {bar: 0, offset: 0});
    } else {
      return this.Create(baseNoteId, instrumentId, duration, position);
    }
  }

  private Create(baseNoteId: number,
                 instrumentId: number,
                 duration: NoteDuration,
                 position: NotePosition): SequencerNote {
    return new SequencerNote(this.getID(baseNoteId, instrumentId, duration, position),
      baseNoteId, instrumentId, duration, position);
  }

  private getID(baseNoteId: number,
                instrumentId: number,
                duration: NoteDuration,
                position: NotePosition) {
    return instrumentId * this.ID_MULTIPLIER_INSTRUMENT
      + baseNoteId * this.ID_MULTIPLIER_BASE_NOTE
      + duration * this.ID_MULTIPLIER_DURATION
      + position * this.ID_MULTIPLIER_POSITION;
  }

  /**
   * Checks whether the Sequencer Note ID includes Instrument ID as prefix.
   * It is likely to be faster in most cases to make a check by this static method, then acquiring Instrument model
   * from service and comparing IDs manually.
   */
  hasInstrumentPreffix(instrumentId: number, sequencerNoteId: number): boolean {
    return instrumentId == Math.trunc(sequencerNoteId / this.ID_MULTIPLIER_INSTRUMENT);
  }
}
