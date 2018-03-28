import {Injectable} from '@angular/core';
import {SequencerNote, NoteDuration, NotePosition, NoteDurationEnum} from '@core/models';

@Injectable()
export class SequencerNoteService {

  // Bitwise offsets of sequencer note information in its ID (used in getID())
  private readonly ID_MULTIPLIER_BASE_NOTE = 1;
  private readonly ID_MULTIPLIER_INSTRUMENT = this.ID_MULTIPLIER_BASE_NOTE * 200;
  private readonly ID_MULTIPLIER_DURATION = this.ID_MULTIPLIER_INSTRUMENT * 10000;
  private readonly ID_MULTIPLIER_POSITION = this.ID_MULTIPLIER_DURATION * 32;

  constructor() {
  }

  /**
   * Get a sequencer note according to parameters.
   * @param {number} baseNoteId Id of the base note (object, containing frequency, name etc).
   * @param {number} instrumentId Id of instrument.
   * @param {NoteDuration} duration Object with information about duration.
   * @param {NotePosition} position Object with information about position (bar, offset).
   * @param {number} id Id of the note.
   */
  getSequencerNote(baseNoteId: number,
                   instrumentId: number,
                   duration?: NoteDuration,
                   position?: NotePosition,
                   id?: number): SequencerNote {

    // Parameters may not contain methods as they may be received from server.
    // Create objects with their data to fill objects with missing methods.
    let populatedDuration;
    let populatedPosition;

    if (typeof duration == 'undefined' && typeof position == 'undefined') {

      // Create default objects
      populatedDuration = new NoteDuration(NoteDurationEnum.Infinite);
      populatedPosition = new NotePosition(0, 0);

    } else {

      // Check if duration and position objects have methods, not only properties.
      if (duration.getHash && position.getHash) {

        // Use function parameters
        populatedDuration = duration;
        populatedPosition = position;

      } else {

        // Restore objects using function parameters
        populatedDuration = new NoteDuration(duration.baseDuration, duration.dotted, duration.triplet);
        populatedPosition = new NotePosition(position.bar, position.offset);

      }

    }

    if (typeof id == 'undefined') {
      id = this.getID(baseNoteId, instrumentId, populatedDuration, populatedPosition);
    }

    return new SequencerNote(id, baseNoteId, instrumentId, populatedDuration, populatedPosition);

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
   hasInstrumentPrefix(instrumentId: number, sequencerNoteId: number): boolean {
    const InstrumentIdMax = 1000;
    return instrumentId == Math.trunc(sequencerNoteId / this.ID_MULTIPLIER_INSTRUMENT % InstrumentIdMax);
   }
}
