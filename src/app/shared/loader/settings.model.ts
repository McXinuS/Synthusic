import {Scale} from "../note/scale.model";
import {Instrument} from "../instrument/instrument.model";
import {Room} from "../room/room.model";
import {SequencerNote} from "../sequencer/sequencernote.model";

export class Settings {
  // server-side
  room: Room;
  bpm: number;
  notes: SequencerNote[];
  instruments: Instrument[];

  // client-side constants
  scale: Scale;
  firstNote: {name: string, octave: number};
  lastNote: {name: string, octave: number};
  masterGainMax: number;
}
