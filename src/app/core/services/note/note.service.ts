import {Injectable} from '@angular/core';
import {BaseNote, Scale, Settings} from '@core/models';

class NoteInfo {
  public name: string;
  public octave: number;

  constructor(name: string,
              octave: number) {
    this.name = name;
    this.octave = octave;
  }
}

@Injectable()
export class NoteService {
  private _notes: BaseNote[] = [];
  get notes(): BaseNote[] {
    return this._notes;
  }

  private _scale: Scale;
  private _firstNote: BaseNote;
  noteCount: number;

  // interval of each note from 'A' note
  readonly interval = {
    'C': -9,
    'D': -7,
    'E': -5,
    'F': -4,
    'G': -2,
    'A': 0,
    'B': 2,
  };

  init(settings: Settings) {
    let startName = settings.firstNote.name,
      startOctave = settings.firstNote.octave,
      endName = settings.lastNote.name,
      endOctave = settings.lastNote.octave;
    this._scale = settings.scale;
    let scale = this._scale.notes,
      scaleLength = scale.length,
      accidentalPlaceholder = this._scale.accidentalPlaceholder,
      accidentalSign = this._scale.accidentalSign;

    this.noteCount = (endOctave - startOctave) * scaleLength - scale.indexOf(startName) + scale.indexOf(endName) + 1;
    let index = 0;

    for (let i = 0; i < this.noteCount; i++) {
      let octave = startOctave + Math.floor((i + scale.indexOf(startName)) / scaleLength);
      let name = scale[(scale.indexOf(startName) + i) % scaleLength];
      let fullname = (name + octave).replace(accidentalPlaceholder, accidentalSign);
      let isAccidental = !!name[1];
      if (!isAccidental) index++;
      let freq = this.getFrequency(name, octave);
      this._notes[i] = new BaseNote(i, index, name, octave, fullname, isAccidental, freq);
    }
    this._firstNote = this.notes[0];
  }

  getNote(index: number): BaseNote;
  getNote(fullname: string): BaseNote;
  getNote(indexOrFullname: number | string): BaseNote {
    if (typeof indexOrFullname == 'number') {
      return this._notes[indexOrFullname];
    }
    if (typeof indexOrFullname == 'string') {
      let targetNote = this.parseFullName(indexOrFullname.toUpperCase());
      let index = this.getIndex(targetNote);
      return this._notes[index];
    }
    return null;
  }

  /**
   * Split note's full name into name and octave considering accidental.
   * @returns {string[]} Array with name and octave.
   */
  private parseFullName(fullname): NoteInfo {

    let name: string;
    let octave: number;

    let octaveStr: string;

    // Parse full note name into name with/without accidental and octave
    // Check for accidental
    if (fullname.length == 2) {
      // No acc.
      name = fullname[0];
      octaveStr = fullname[1];
    } else if (fullname.length == 3) {
      // Has acc.
      name = fullname.substr(0, 2);
      octaveStr = fullname[2];
    }

    // Check if full note name has unknown schema
    if (fullname.length !==1 && fullname.length !==2) {
      throw new Error('Wrong full note name schema.');
    }

    octave = parseInt(octaveStr);
    if (isNaN(octave)) {
      throw new Error(`Octave must be a number.`);
    }

    // Check for note name to be 'a'-'h'
    let noteName = name[0].toLocaleLowerCase();
    if (!/[a-h]/.test(noteName)) {
      throw new Error(`Wrong note name: ${name[0]}.`);
    }

    return new NoteInfo(name, octave);
  }

  private getIndex(target: NoteInfo): number {
    // Number of octaves from the first base note
    let octave = target.octave - this._firstNote.octave;
    let scaleLength = this._scale.notes.length;
    return octave * scaleLength
      - this._scale.notes.indexOf(this._firstNote.name)
      + this._scale.notes.indexOf(target.name);
  }

  private getFrequency(name, octave) {
    let inter = this.interval[name[0]];
    if (name[1]) inter += this._scale.accidentalStep;
    inter = (octave - 4) + inter / 12.0;
    return 440. * Math.pow(2.0, inter);
  }
}
