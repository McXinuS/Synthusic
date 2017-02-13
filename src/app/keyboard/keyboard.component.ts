import {Component, OnInit} from '@angular/core';
import {Note} from "../shared/note/note.model";
import {NoteService} from "../shared/note/note.service";
import {KeyChangeMode} from "./key/keychangemode.enum";
import {SequencerService} from "../shared/sequencer/sequencer.service";
import {BroadcasterService} from "../shared/broadcaster/broadcaster.service";
import {BroadcastTopic} from "../shared/broadcaster/broadcasttopic.enum";
import {Instrument} from "../shared/instrument/instrument.model";
import {InstrumentService} from "../shared/instrument/instrument.service";
import {SequencerNoteService} from "../shared/sequencer/sequencernote.service";
import {PopupService} from "../shared/popup/popup.service";

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent implements OnInit {
  highlights: boolean[];
  notes: Note[];

  instruments: Instrument[];
  activeInstrument: Instrument;

  containerScrollWidth: number;
  miniMode: boolean = false;

  constructor(private noteService: NoteService,
              private sequencerService: SequencerService,
              private sequencerNoteService: SequencerNoteService,
              private broadcaster: BroadcasterService,
              private instrumentService: InstrumentService,
              private popupService: PopupService) {
  }

  ngOnInit() {
    this.notes = this.noteService.notes;
    this.highlights = this.sequencerService.playingNotes;
    this.instruments = this.instrumentService.instruments;
    this.activeInstrument = this.instrumentService.instruments[0];
  }

  onKeyStateUpdated(e) {
    switch (e.mode) {
      case KeyChangeMode.play:
        this.playNote({note: e.note, broadcast: true});
        return;
      case KeyChangeMode.stop:
        this.stopNote({note: e.note, broadcast: true});
        return;
    }
  }

  playNote({note, broadcast = false}: {note: Note, broadcast: boolean}) {
    let ns = this.sequencerNoteService.getSequencerNote(note, this.activeInstrument);
    if (broadcast) {
      this.broadcaster.broadcast(BroadcastTopic.playNote, ns);
    }
  }

  stopNote({note, broadcast = false}: {note: Note, broadcast: boolean}) {
    let ns = this.sequencerNoteService.getSequencerNote(note, this.activeInstrument);
    if (broadcast) {
      this.broadcaster.broadcast(BroadcastTopic.stopNote, ns);
    }
  }

  onMiniChange(e) {
    if (e.which == 1) this.miniMode = !this.miniMode;
  }

  openSettings() {
    this.popupService.show(this.activeInstrument);
  }
}
