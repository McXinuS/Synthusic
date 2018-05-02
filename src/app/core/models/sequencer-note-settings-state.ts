import {Point, SequencerNote} from "@shared-global/models";

export class SequencerNoteSettingsState {
  constructor(public note: SequencerNote,
              public position: Point,
              public isShown: boolean) {
  }
}
