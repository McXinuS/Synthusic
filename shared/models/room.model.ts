import {User} from "./user.model";
import {Instrument} from "./instrument.model";
import {SequencerNote} from "./sequencer-note.model";

export class Room {
  constructor(public id: number,
              public bpm: number,
              public name: string,
              public users: User[],
              public maxUsers: number,
              public isLocked: boolean,
              public instruments: Instrument[],
              public notes: SequencerNote[]) {
  }
}
