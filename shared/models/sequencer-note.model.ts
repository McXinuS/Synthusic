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

  getHash(): string {
    return this.baseNoteId + '-' +
      this.instrumentId + '-' +
      this.duration.getHash() + '-' +
      this.position.getHash();
  }

  isEqual(note: SequencerNote): boolean {
    return this.id === note.id;
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

const BaseDurationMask = 0x00111;
const DotMask = 0x10000;
const TripletMask = 0x01000;
const InfiniteNoteHash = 0x11111;

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
    if (this.baseDuration === NoteDurationEnum.Infinite) return InfiniteNoteHash;

    let res = Math.log2(this.baseDuration);
    if (this.dotted) res |= DotMask;
    if (this.triplet) res |= TripletMask;
    return res;
  }

  static fromHash(hash: number): NoteDuration {
    if (hash === InfiniteNoteHash) {
      return new NoteDuration(NoteDurationEnum.Infinite, false, false);
    }

    let duration = (hash & BaseDurationMask)**2,
      dotted = !!(hash & DotMask),
      triplet = !!(hash & TripletMask);
    return new NoteDuration(duration, dotted, triplet);
  }
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

  static fromHash(hash: number): NotePosition {
    return new NotePosition(hash%BarMax, Math.floor(hash/BarMax));
  }

  isEqual(notePosition: NotePosition): boolean {
    return this.bar === notePosition.bar && this.offset === notePosition.offset;
  }
}
