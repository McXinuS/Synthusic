import {Settings} from "./settings.model";
import {INSTRUMENTS} from "../instrument/instrument.mock";
import {CONSTANTS} from "./config.constants";

let SETTINGS_OFFLINE: Settings = Object.assign({}, CONSTANTS, {
  currentUser: {id: 0, name: 'Offline  user'},
  room: {
    name: 'Offline room',
    users: [this.currentUser]
  },
  notes: [],
  instruments: INSTRUMENTS,
  bpm: 60
});

export {
  SETTINGS_OFFLINE
};
