import {User} from "./user.model";
import {Instrument} from "./instrument.model";
import {SequencerNote} from "./sequencer-note.model";

export class Room {
  constructor(public bpm: number,
              public name: string,
              public users: User[],
              public instruments: Instrument[],
              public notes: SequencerNote[]) {
  }
}
