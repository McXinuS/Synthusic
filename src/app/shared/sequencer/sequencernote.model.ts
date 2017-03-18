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

export class NoteDuration {
  baseDuration: NoteDurationEnum;
  dotted: boolean;
  triplet: boolean;

  private readonly DottedShift: number = 0x10000;
  private readonly TripletShift: number = 0x01000;

  constructor(baseDuration: NoteDurationEnum, dotted?: boolean, triplet?: boolean) {
    this.baseDuration = baseDuration;
    this.dotted = dotted || false;
    this.triplet = triplet || false;
  }

  getHash(): number {
    let res = -Math.log2(this.baseDuration);
    if (this.dotted) res |= this.DottedShift;
    if (this.triplet) res |= this.TripletShift;
    return res;
  }
}

// TODO: 16, 32
export enum NoteDurationEnum {
  Infinite = -1,
  Whole = 1,
  Half = Whole / 2,
  Quarter = Half / 2,
  Eighth = Quarter / 2,
  Sixteenth = Eighth / 2,
  ThirtySecond = Sixteenth / 2
}

export class NotePosition {
  bar: number;
  offset: number;
  private BarMax: number = 1000;

  constructor(bar: number, offset: number) {
    this.bar = bar;
    this.offset = offset;
  }

  getHash(): number {
    return this.offset * this.BarMax + this.bar;
  }
}
