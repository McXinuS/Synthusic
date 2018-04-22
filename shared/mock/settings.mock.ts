import {Settings} from "../models";
import {INSTRUMENTS} from "./instrument.mock";
import {CONSTANTS} from "../../src/app/core/services/loader/config.constants";

let users = [{id: 0, name: 'Offline  user'}];

let SETTINGS_OFFLINE: Settings = Object.assign({}, CONSTANTS, {
  currentUser: users[0],
  room: {
    id: 0,
    name: 'Offline room',
    users: users,
    maxUsers: 2,
    isLocked: true,
    bpm: 60,
    notes: [],
    instruments: INSTRUMENTS
  }
});

export {
  SETTINGS_OFFLINE
};
