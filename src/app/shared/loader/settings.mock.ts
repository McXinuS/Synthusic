import {Settings} from "./settings.model";
import {INSTRUMENTS} from "../instrument/instrument.mock";
import {CONSTANTS} from "./config.constants";

let users = [{id: 0, name: 'Offline  user'}];

let SETTINGS_OFFLINE: Settings = Object.assign({}, CONSTANTS, {
  currentUser: users[0],
  room: {
    name: 'Offline room',
    users: users
  },
  notes: [],
  instruments: INSTRUMENTS,
  bpm: 60
});

export {
  SETTINGS_OFFLINE
};
