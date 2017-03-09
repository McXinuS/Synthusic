import {Scale} from "../note/scale.model";
import {Instrument} from "../instrument/instrument.model";
import {Room} from "../room/room.model";

export class Settings {
  // server-side
  room: Room;
  bpm: number;
  notes: number[];
  instruments: Instrument[];

  // client-side
  scale: Scale;
  firstNote: {name: string, octave: number};
  lastNote: {name: string, octave: number};
  masterGainMax: number;
}
