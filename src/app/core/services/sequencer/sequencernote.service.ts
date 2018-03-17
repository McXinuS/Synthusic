import {Injectable} from '@angular/core';
import {SequencerNote, NoteDuration, NotePosition, NoteDurationEnum} from '@core/models';

@Injectable()
export class SequencerNoteService {

  // Offsets of ID's
  private readonly ID_MULTIPLIER_BASE_NOTE = 1;
  private readonly ID_MULTIPLIER_INSTRUMENT = this.ID_MULTIPLIER_BASE_NOTE * 200;
  private readonly ID_MULTIPLIER_DURATION = this.ID_MULTIPLIER_INSTRUMENT * 10000;
  private readonly ID_MULTIPLIER_POSITION = this.ID_MULTIPLIER_DURATION * 32;

  constructor() {
  }

  getSequencerNote(baseNoteId: number,
                   instrumentId: number,
                   duration?: NoteDuration,
                   position?: NotePosition): SequencerNote {

    if (typeof duration == 'undefined' && typeof position == 'undefined') {
      let duration = new NoteDuration(NoteDurationEnum.Infinite);
      let position = new NotePosition(0, 0);
      return this.Create(baseNoteId, instrumentId, duration, position);
    } else {
      return this.Create(baseNoteId, instrumentId, duration, position);
    }
  }

  getNoteById(id: string): SequencerNote {
    let [baseNote, instrument, durHash, posHash] = id
      .split('-')
      .map(num => parseInt(num));

    let duration = NoteDuration.fromHash(durHash);
    let position = NotePosition.fromHash(posHash);

    return this.getSequencerNote(baseNote, instrument, duration, position);
  }


  private Create(baseNoteId: number,
                 instrumentId: number,
                 duration: NoteDuration,
                 position: NotePosition): SequencerNote {
    return new SequencerNote(
      this.getID(baseNoteId, instrumentId, duration, position),
      baseNoteId, instrumentId, duration, position
    );
  }

  private getID(baseNoteId: number,
                instrumentId: number,
                duration: NoteDuration,
                position: NotePosition) {
    return instrumentId * this.ID_MULTIPLIER_INSTRUMENT
      + baseNoteId * this.ID_MULTIPLIER_BASE_NOTE
      + duration.getHash() * this.ID_MULTIPLIER_DURATION
      + position.getHash() * this.ID_MULTIPLIER_POSITION;
  }

  /**
   * Checks whether the Sequencer Note ID includes Instrument ID as prefix.
   * It is likely to be faster in most cases to make a check by this static method, then acquiring Instrument model
   * from service and comparing IDs manually.
   */
   hasInstrumentPreffix(instrumentId: number, sequencerNoteId: number): boolean {
    const InstrumentIdMax = 1000;
    return instrumentId == Math.trunc(sequencerNoteId / this.ID_MULTIPLIER_INSTRUMENT % InstrumentIdMax);
   }
}
