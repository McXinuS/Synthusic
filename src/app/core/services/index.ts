/**
 * I decided to add barrels to every subfolder.
 * Barrels (index.ts files) of each subfolder exports services and some classes/functions that should be exposed
 *  to other parts of the application. It makes easier to import one service from another.
 *
 * Important! Every time one service imports another it should not be done using
 *  '@core/services)
 *  use instead
 *  '../(service_folder)/(service_name).service'.
 *  Otherwise the circular dependency error will occur.
 */

// Export services to make them available through '@core/services'.
export * from './instrument'
export * from './loader'
export * from './note'
export * from './popup'
export * from './room'
export * from './sequencer'
export * from './sound'
export * from './websocket'
export * from './navbar'

// Import services to pass them into CoreModule using SERVICES array.
import {InstrumentService} from './instrument'
import {LoaderService} from './loader'
import {NoteService} from './note'
import {PopupService} from './popup'
import {RoomService} from './room'
import {SequencerNoteService, SequencerService, StaffService} from './sequencer'
import {SoundService} from './sound'
import {WebSocketService} from './websocket'
import {NavbarService} from './navbar'

export const SERVICES = [
  InstrumentService,
  LoaderService,
  NoteService,
  PopupService,
  RoomService,
  SequencerNoteService,
  SequencerService,
  StaffService,
  SoundService,
  WebSocketService,
  NavbarService,
];
