import {Scale} from "./scale.model";
import {Room} from "./room.model";
import {User} from "./user.model";

export class Settings {
  // server-side
  room: Room;
  currentUser: User;

  // client-side constants
  scale: Scale;
  firstNote: {name: string, octave: number};
  lastNote: {name: string, octave: number};
  masterGainMax: number;
}
