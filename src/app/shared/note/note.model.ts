/**
 * Represents a musical note. Contains the following attributes:
 * name, octave, full name, frequency and index in the current synthesizer state.
 */
export class Note {
  readonly name: string;
  readonly octave: number;
  readonly fullname: string;
  readonly isAccidental: boolean;
  readonly freq: number;
  readonly index: number;

  constructor(name: string, octave: number, fullname: string, isAccidental: boolean, freq: number, index: number) {
    this.name = name;
    this.octave = octave;
    this.fullname = fullname;
    this.isAccidental = isAccidental;
    this.freq = freq;
    this.index = index;
  }

  toString() {
    return this.fullname;
  }
}
