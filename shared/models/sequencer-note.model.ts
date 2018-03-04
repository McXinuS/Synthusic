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

const InfiniteNoteHash = 0x11111;
const DottedShift = 0x10000;
const TripletShift = 0x01000;
export class NoteDuration {
  baseDuration: NoteDurationEnum;
  dotted: boolean;
  triplet: boolean;

  constructor(baseDuration: NoteDurationEnum, dotted?: boolean, triplet?: boolean) {
    this.baseDuration = baseDuration;
    this.dotted = dotted || false;
    this.triplet = triplet || false;
  }

  isInfinite(): boolean {
    return this.baseDuration === NoteDurationEnum.Infinite;
  }

  getHash(): number {
    if (this.baseDuration == NoteDurationEnum.Infinite) return InfiniteNoteHash;

    let res = Math.log2(this.baseDuration);
    if (this.dotted) res |= DottedShift;
    if (this.triplet) res |= TripletShift;
    return res;
  }
}

export enum NoteDurationEnum {
  Infinite = -1,
  Whole = 1,
  Half = Whole * 2,
  Quarter = Half * 2,
  Eighth = Quarter * 2,
  Sixteenth = Eighth * 2,
  ThirtySecond = Sixteenth * 2
}

const BarMax = 1000;
export class NotePosition {
  bar: number;
  offset: number;

  constructor(bar: number, offset: number) {
    this.bar = bar;
    this.offset = offset;
  }

  getHash(): number {
    return this.offset * BarMax + this.bar;
  }
}
