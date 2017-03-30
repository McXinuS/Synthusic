import {Scale} from "../note/scale.model";
import {Instrument} from "../instrument/instrument.model";
import {Room} from "../room/room.model";
import {SequencerNote} from "../sequencer/sequencernote.model";
import {User} from "../room/user.model";

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
