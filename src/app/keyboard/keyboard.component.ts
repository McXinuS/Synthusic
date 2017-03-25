import {Component, OnInit} from '@angular/core';
import {BaseNote} from '../shared/note/note.model';
import {NoteService} from '../shared/note/note.service';
import {KeyChangeMode} from './key/keychangemode.enum';
import {SoundService} from '../shared/sound/sound.service';
import {Instrument} from '../shared/instrument/instrument.model';
import {InstrumentService} from '../shared/instrument/instrument.service';
import {SequencerNoteService} from '../shared/sequencer/sequencernote.service';
import {PopupService} from '../shared/popup/popup.service';
import {SequencerNote} from '../shared/sequencer/sequencernote.model';
import {SequencerService} from "../shared/sequencer/sequencer.service";

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent implements OnInit {
  highlights: boolean[];
  notes: BaseNote[];

  instruments: Instrument[];
  activeInstrument: Instrument;
  playingNotes: SequencerNote[];

  miniMode: boolean = false;

  constructor(private noteService: NoteService,
              private soundService: SoundService,
              private sequencerService: SequencerService,
              private sequencerNoteService: SequencerNoteService,
              private instrumentService: InstrumentService,
              private popupService: PopupService) {
  }

  ngOnInit() {
    this.notes = this.noteService.notes;

    this.soundService.playingNotes$.subscribe((playingNotes: SequencerNote[]) => {
      this.playingNotes = playingNotes;
      this.updateHighlight();
    });

    this.instrumentService.instruments$.subscribe(instruments => {
      this.instruments = instruments;
      if (!this.activeInstrument) {
        this.activeInstrument = this.instruments[0];
      }
    });
  }

  updateHighlight() {
    this.highlights = [];
    let playing = this.playingNotes;
    for (let i = 0; i < playing.length; i++) {
      if (playing[i].instrumentId == this.activeInstrument.id) {
        this.highlights[playing[i].baseNoteId] = true;
      }
    }
  }

  onInstrumentChange() {
    this.updateHighlight();
  }

  onKeyStateUpdated(e) {
    switch (e.mode) {
      case KeyChangeMode.play:
        this.playNote(e.note);
        return;
      case KeyChangeMode.stop:
        this.stopNote(e.note);
        return;
    }
  }

  playNote(note: BaseNote) {
    if (!this.activeInstrument) return;
    let ns = this.sequencerNoteService.getSequencerNote(note.id, this.activeInstrument.id);
    this.soundService.playNote(ns);
    //DEBUG
    //this.sequencerService.addNote(ns);
  }

  stopNote(note: BaseNote) {
    if (!this.activeInstrument) return;
    let ns = this.sequencerNoteService.getSequencerNote(note.id, this.activeInstrument.id);
    this.soundService.stopNote(ns);
    //DEBUG
    //this.sequencerService.removeNote(ns);
  }

  onMiniChange(e) {
    if (e.which === 1) this.miniMode = !this.miniMode;
  }

  openSettings() {
    this.popupService.showInstrument(this.activeInstrument);
  }
}
