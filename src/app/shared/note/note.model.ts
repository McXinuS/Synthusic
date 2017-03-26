/**
 * Represents a musical note. Contains the following attributes:
 * id, name, octave, full name, frequency.
 */
export class BaseNote {
  readonly id: number;
  readonly index: number;
  readonly name: string;
  readonly pitchNameLower: string;
  readonly octave: number;
  readonly fullname: string;
  readonly isAccidental: boolean;
  readonly freq: number;

  constructor(id: number, index: number, name: string, octave: number,
              fullname: string, isAccidental: boolean, freq: number) {
    this.id = id;
    this.index = index;
    this.name = name;
    this.pitchNameLower = name[0].toLowerCase();
    this.octave = octave;
    this.fullname = fullname;
    this.isAccidental = isAccidental;
    this.freq = freq;
  }

  toString() {
    return this.fullname;
  }
}
