import {Injectable} from '@angular/core';
import {SequencerNote, NoteDuration, NotePosition, NoteDurationEnum} from '@core/models';
import {Utils} from "@shared/utilities";
import {DimSequencerNote} from "@shared-global/models";

@Injectable()
export class SequencerNoteService {

  private notes: SequencerNote[] = [];

  constructor() {
  }

  /**
   * Get a sequencer note according to parameters.
   * @param {number} baseNoteId Id of the base note (object, containing frequency, name etc).
   * @param {number} instrumentId Id of instrument.
   * @param {boolean} isRest Whether or not the note is a rest (pause).
   * @param {NoteDuration} duration Object with information about duration.
   * @param {NotePosition} position Object with information about position (bar, offset).
   * @param {number} id Id of the note.
   */
  createSequencerNote(id: number,
                      baseNoteId: number,
                      instrumentId: number,
                      isRest: boolean = false,
                      duration: NoteDuration,
                      position: NotePosition): SequencerNote {

    // Duration and position parameters are lack of methods when received from server.
    // Create objects using parameters' data to fill objects with missing methods.
    let populatedDuration = new NoteDuration(duration.baseDuration, duration.dotted, duration.triplet);
    let populatedPosition = new NotePosition(position.bar, position.offset);

    return new SequencerNote(id, baseNoteId, instrumentId, isRest, populatedDuration, populatedPosition);

  }

  /**
   * Create incomplete (diminished) version of the sequencer note, containing only note and instrument information.
   * @param {number} baseNoteId
   * @param {number} instrumentId
   */
  getDimSequencerNote(baseNoteId: number, instrumentId: number): DimSequencerNote {
    return new DimSequencerNote(baseNoteId, instrumentId);
  }

  getNoteById(id: number): SequencerNote {
    if (id >= 0) {
      return this.notes.find(note => note.id === id);
    } else {
      // Return diminished sequencer note.
      return this.getDimNoteById(id);
    }
  }

  setNotes(notes: SequencerNote[]) {
    this.notes = notes;
  }

  private getDimNoteById(id: number): DimSequencerNote {
    return DimSequencerNote.fromHash(id);
  }

}
