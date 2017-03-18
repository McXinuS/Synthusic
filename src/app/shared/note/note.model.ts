/**
 * Represents a musical note. Contains the following attributes:
 * id, name, octave, full name, frequency.
 */
export class BaseNote {
  readonly id: number;

  readonly name: string;
  readonly octave: number;
  readonly fullname: string;

  readonly isAccidental: boolean;
  readonly freq: number;

  constructor(name: string, octave: number, fullname: string, isAccidental: boolean, freq: number, id: number) {
    this.name = name;
    this.octave = octave;
    this.fullname = fullname;
    this.isAccidental = isAccidental;
    this.freq = freq;
    this.id = id;
  }

  toString() {
    return this.fullname;
  }
}
