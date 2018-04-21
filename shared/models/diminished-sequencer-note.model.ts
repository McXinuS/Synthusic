import {NoteDuration, NoteDurationEnum, NotePosition, SequencerNote} from "./sequencer-note.model";


const DimSnDuration = new NoteDuration(NoteDurationEnum.Infinite, false, false);
const DomSnPosition = new NotePosition(0, 0);
const InstrumentOffset = 1000;

function getId(baseNoteId, instrumentId): number {
  return - (instrumentId * InstrumentOffset + baseNoteId);
}
function parseId(id: number): {baseNoteId: number, instrumentId: number} {
  return {
    baseNoteId: -id % InstrumentOffset,
    instrumentId:  Math.floor(-id / InstrumentOffset)
  }
}


/**
 * Incomplete (diminished) version of sequencer note, containing only base note and instrument information.
 */
export class DimSequencerNote extends SequencerNote {

  constructor(public baseNoteId: number,
              public instrumentId: number) {
    super(getId(baseNoteId, instrumentId), baseNoteId, instrumentId, false, DimSnDuration, DomSnPosition);
  }

  static fromHash(hash: number): DimSequencerNote {
    let args = parseId(hash);
    return new DimSequencerNote(args.baseNoteId, args.instrumentId);
  }
}
