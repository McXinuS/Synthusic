import {Component, OnInit} from '@angular/core';
import {Note} from '../shared/note/note.model';
import {NoteService} from '../shared/note/note.service';
import {KeyChangeMode} from './key/keychangemode.enum';
import {SoundService} from '../shared/sound/sound.service';
import {BroadcasterService} from '../shared/broadcaster/broadcaster.service';
import {BroadcastTopic} from '../shared/broadcaster/broadcasttopic.enum';
import {Instrument} from '../shared/instrument/instrument.model';
import {InstrumentService} from '../shared/instrument/instrument.service';
import {SequencerNoteService} from '../shared/sequencer/sequencernote.service';
import {PopupService} from '../shared/popup/popup.service';
import {SequencerNote} from '../shared/sequencer/sequencernote.model';

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

  miniMode: boolean = false;

  constructor(private noteService: NoteService,
              private soundService: SoundService,
              private sequencerNoteService: SequencerNoteService,
              private broadcaster: BroadcasterService,
              private instrumentService: InstrumentService,
              private popupService: PopupService) {
  }

  ngOnInit() {
    this.notes = this.noteService.notes;

    this.soundService.playingNotes.subscribe((playing: SequencerNote[]) => {
      this.highlights = [];
      for (let i=0; i<playing.length; i++) {
        if (playing[i].instrument.id == this.activeInstrument.id) {
          this.highlights[playing[i].note.index] = true;
        }
      }
      
      /*
      let pl = playing
        .filter(sn => sn.instrument.id == this.activeInstrument.id)
        .map(sn => sn.note.index);
      this.highlights = [];
      for (let ind of pl) {
        this.highlights[ind] = true;
      }
      */
    });

    this.instrumentService.instruments.subscribe(instruments => {
      this.instruments = instruments;
      if (!this.activeInstrument) {
        this.activeInstrument = this.instruments[0];
      }
    });
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
    if (!this.activeInstrument) return;
    let ns = this.sequencerNoteService.getSequencerNote(note, this.activeInstrument);
    if (broadcast) {
      this.broadcaster.broadcast(BroadcastTopic.playNote, ns);
    }
  }

  stopNote({note, broadcast = false}: {note: Note, broadcast: boolean}) {
    if (!this.activeInstrument) return;
    let ns = this.sequencerNoteService.getSequencerNote(note, this.activeInstrument);
    if (broadcast) {
      this.broadcaster.broadcast(BroadcastTopic.stopNote, ns);
    }
  }

  onMiniChange(e) {
    if (e.which === 1) this.miniMode = !this.miniMode;
  }

  openSettings() {
    this.popupService.show(this.activeInstrument);
  }
}
