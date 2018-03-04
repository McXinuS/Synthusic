import {Scale} from "./scale.model";
import {Instrument} from "./instrument.model";
import {Room} from "./room.model";
import {SequencerNote} from "./sequencer-note.model";
import {User} from "./user.model";

export class Settings {
  // server-side
  room: Room;
  bpm: number;
  notes: SequencerNote[];
  instruments: Instrument[];
  currentUser: User;

  // client-side constants
  scale: Scale;
  firstNote: {name: string, octave: number};
  lastNote: {name: string, octave: number};
  masterGainMax: number;
}
