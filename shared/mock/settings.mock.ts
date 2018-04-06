import {Settings} from "../models";
import {INSTRUMENTS} from "./instrument.mock";
import {CONSTANTS} from "../../src/app/core/services/loader/config.constants";

let users = [{id: 0, name: 'Offline  user'}];

let SETTINGS_OFFLINE: Settings = Object.assign({}, CONSTANTS, {
  currentUser: users[0],
  room: {
    id: 0,
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
