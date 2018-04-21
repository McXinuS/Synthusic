export class SequencerNote{

  constructor(public id: number,
              public baseNoteId: number,
              public instrumentId: number,
              public isRest: boolean,
              public duration: NoteDuration,
              public position: NotePosition) {
  }

  getHash(): string {
    return this.baseNoteId + '-' +
      this.instrumentId + '-' +
      (this.isRest ? 1 : 0) + '-' +
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

const BaseDurationMask = 0b00111;
const DotMask = 0b10000;
const TripletMask = 0b01000;
const InfiniteNoteHash = 0b11111;

export class NoteDuration {

  constructor(public baseDuration: NoteDurationEnum,
              public dotted: boolean = false,
              public triplet: boolean = false) {
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

    let duration = (hash & BaseDurationMask) ** 2,
      dotted = !!(hash & DotMask),
      triplet = !!(hash & TripletMask);
    return new NoteDuration(duration, dotted, triplet);
  }
}

const BarMax = 1000;

export class NotePosition {

  constructor(public bar: number,
              public offset: number) {
  }

  getHash(): number {
    return this.offset * BarMax + this.bar;
  }

  static fromHash(hash: number): NotePosition {
    return new NotePosition(hash % BarMax, Math.floor(hash / BarMax));
  }

  isEqual(notePosition: NotePosition): boolean {
    return this.bar === notePosition.bar && this.offset === notePosition.offset;
  }
}
