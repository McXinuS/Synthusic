export class SequencerNote {
  readonly id: number;
  readonly baseNoteId: number;
  readonly duration: NoteDuration;
  readonly position: NotePosition;
  readonly instrumentId: number;

  constructor(id: number, baseNoteId: number, instrumentId: number, duration: NoteDuration, position: NotePosition) {
    this.id = id;
    this.baseNoteId = baseNoteId;
    this.instrumentId = instrumentId;
    this.duration = duration;
    this.position = position;
  }
}

// TODO: triplet, dotted
export enum NoteDuration {
  Infinite = 1,
  Whole = 1,
  Half = .5,
  Quarter = .25,
  Eighth = .125
}

const NoteDurationId: Map<NoteDuration, number> = new Map();
for (let dur of NoteDuration) {
  if (typeof dur == 'string') {

  }
}
export const NoteDurationValue;

export class NotePosition {
  bar: number;
  offset: number;

  constructor(bar: number, offset: number) {
    this.bar = bar;
    this.offset = offset;
  }
}
