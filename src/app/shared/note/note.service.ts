import {Injectable} from '@angular/core';
import {Note} from './note.model';
import {Scale} from './scale.model';
import {Settings} from "../loader/settings.model";

@Injectable()
export class NoteService {
  private _notes: Note[] = [];
  get notes(): Note[] {
    return this._notes;
  }

  private _noteCount: number;
  get noteCount(): number {
    return this._noteCount;
  }

  private _firstNote: Note;
  get firstNote(): Note {
    return this._firstNote;
  }

  private _lastNote: Note;
  get lastNote(): Note {
    return this._lastNote;
  }

  private _scale: Scale;
  get scale(): Scale {
    return this._scale;
  }

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
    let scale = this._scale.scale,
      scaleLength = scale.length,
      accidentalPlaceholder = this._scale.accidentalPlaceholder,
      accidentalSign = this._scale.accidentalSign;

    this._noteCount = (endOctave - startOctave) * scaleLength - scale.indexOf(startName) + scale.indexOf(endName) + 1;
    for (let i = 0; i < this._noteCount; i++) {
      let octave = startOctave + Math.floor((i + scale.indexOf(startName)) / scaleLength);
      let name = scale[(scale.indexOf(startName) + i) % scaleLength];
      let fullname = (name + octave).replace(accidentalPlaceholder, accidentalSign);
      let isAccidental = !!name[1];
      let freq = this.getFrequency(name, octave);
      this._notes[i] = new Note(name, octave, fullname, isAccidental, freq, i);
    }
  }

  getNote(index: number): Note;
  getNote(fullname: string): Note;
  getNote(indexOrFullname: number | string): Note {
    if (typeof indexOrFullname == 'number') {
      return this._notes[indexOrFullname];
    }
    if (typeof indexOrFullname == 'string') {
      let no = this.parseFullName(indexOrFullname);
      let index = this.getIndex(no[0], no[1]);
      return this._notes[index];
    }
    return null;
  }

  private getIndex(targetName: string, targetOctave: number) {
    return (targetOctave - this._firstNote.octave) * this._scale.scale.length
      - this._scale.scale.indexOf(this._firstNote.name) + this._scale.scale.indexOf(targetName);
  }

  /**
   * Split note's full name into name and octave.
   * @returns {string[]} Array with name and octave.
   */
  private parseFullName(fullname): [string, number] {
    let res: [string, number];
    if (fullname.length == 2) {
      res[0] = fullname[0];
      res[1] = parseFloat(fullname[1]);
    } else if (fullname.length == 3) {
      res[0] = fullname.substr(0, 2);
      res[1] = parseFloat(fullname[2]);
    } else {
      throw new Error('Wrong full name length.');
    }

    // step is skipped: function 'includes' is not recognized by IDE
    if (['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].findIndex(val => val == res[0][0].toLocaleLowerCase()) == -1) {
      throw new Error(`Wrong note name: ${res[0][0]}.`);
    }
    if (res[0].length == 2 && (res[0][1] != this._scale.accidentalPlaceholder))
      throw new Error(`Wrong accidental: ${res[0][1]}.`);
    if (isNaN(res[1]))
      throw new Error(`Octave must be a number: ${res[1]}.`);

    return res;
  }

  private getFrequency(name, octave) {
    let inter = this.interval[name[0]];
    if (name[1]) inter += this._scale.accidentalStep;
    inter = (octave - 4) + inter / 12.0;
    return 440. * Math.pow(2.0, inter);
  }
}
