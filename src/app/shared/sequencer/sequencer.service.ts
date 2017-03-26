import {Injectable, OnInit} from '@angular/core';
import {SequencerNote} from './sequencernote.model';
import {SequencerNoteService} from './sequencernote.service';
import {SoundService} from '../sound/sound.service';
import {WebSocketService} from '../websocket/websocket.service';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';
import {Subject} from "rxjs";
import {InstrumentService} from "../instrument/instrument.service";
import {Instrument} from "../instrument/instrument.model";
import {NoteService} from "../note/note.service";
import {BaseNote} from "../note/note.model";

declare var verovio: any;

@Injectable()
export class SequencerService {
  /**
   * Array of all notes in sequencer.
   */
  private _notes: SequencerNote[] = [];
  notes$: Subject<SequencerNote[]> = new Subject();

  /**
   * Array of notes that playing at the moment.
   */
  private _playing: number[] = [];
  playing$: Subject<number[]>;

  vrvToolkit = new verovio.toolkit();
  notation: Array<string> = []; // SVGs for every instrument
  instruments: Instrument[];
  baseNotes: BaseNote[];

  readonly BarCount = 20;
  readonly BarsOnScreen = 4;
  readonly LastPageIndex = Math.floor(this.BarCount / this.BarsOnScreen) - 1;
  currentPage = 0;
  canGoPrevPage: boolean = false;
  canGoNextPage: boolean = true;

  staffWidth: number = 1000;

  constructor(private instrumentService: InstrumentService,
              private noteService: NoteService,
              private sequencerNoteService: SequencerNoteService,
              private soundService: SoundService,
              private webSocketService: WebSocketService) {
    this.baseNotes = this.noteService.notes;
    this.instrumentService.instruments$.subscribe(instruments => {
      this.instruments = instruments;
      this.renderNotation();
    });
    this.webSocketService.registerHandler(WebSocketMessageType.note_add, this.onNoteReceived.bind(this, 'add'));
    this.webSocketService.registerHandler(WebSocketMessageType.note_remove, this.onNoteReceived.bind(this, 'remove'));
  }

  /**
   * Called when a note is received by Web Socket
   */
  private onNoteReceived(type: string, note: SequencerNote) {
    if (type === 'add') {
      this.addNote(note, false);
    } else if (type === 'remove') {
      this.removeNote(note, false);
    }
  }

  init(notes: SequencerNote[]) {
    for (let note of notes) {
      this.addNote(note, false);
    }
  }

  addNote(note: SequencerNote, broadcast = true) {
    if (this.hasNote(note)) return;
    this._notes.push(note);
    this.notes$.next(this._notes);
    if (broadcast) {
      this.webSocketService.send(WebSocketMessageType.note_add, note);
    }
    this.renderNotation();
  }

  removeNote(note: SequencerNote, broadcast = true) {
    if (!this.hasNote(note)) return;
    let nsInd = this._notes.findIndex(ns => ns.id === note.id);
    if (nsInd != -1) {
      this._notes.splice(nsInd, 1);
      this.notes$.next(this._notes);
    }
    if (broadcast) {
      this.webSocketService.send(WebSocketMessageType.note_remove, note);
    }
    this.renderNotation();
  }

  hasNote(note: SequencerNote) {
    return this._notes.findIndex(n => note.id == n.id) >= 0;
  }

  playNote(note: SequencerNote) {
    if (this.isPlaying(note)) return;
    this._playing.push(note.id);
    this.soundService.playNote(note);
  }

  stopNote(note: SequencerNote) {
    if (!this.isPlaying(note)) return;
    let nsInd = this._playing.indexOf(note.id);
    if (nsInd != -1) {
      this._playing.splice(nsInd, 1);
    }
    this.soundService.stopNote(note);
  }

  isPlaying(note: SequencerNote) {
    return this._playing.indexOf(note.id) >= 0;
  }

  onStaffResize(staffWidth: number) {
    this.staffWidth = staffWidth;
  }

  goPrevStaffPage() {
    if (this.currentPage <= 0) return;

    this.currentPage--;
    if (this.currentPage < 0) {
      this.currentPage = 0;
    }

    this.onPageChanged();
  }

  goNextStaffPage() {
    if (this.currentPage >= this.LastPageIndex) return;

    this.currentPage++;
    if (this.currentPage > this.LastPageIndex) {
      this.currentPage = this.LastPageIndex;
    }

    this.onPageChanged();
  }

  private onPageChanged() {
    this.canGoPrevPage = this.currentPage > 0;
    this.canGoNextPage = this.currentPage < this.LastPageIndex;
    this.renderNotation();
  }

  renderNotation() {

    if (!this.instruments) return;

    let note: SequencerNote,
      baseNote: BaseNote,
      noteXml,
      restXml,
      trebleNotesXml: Array<Array<string>>,
      bassNotesXml: Array<Array<string>>,
      notationXML;

    for (let instrument of this.instruments) {

      trebleNotesXml = [];
      bassNotesXml = [];
      for (let i = 0; i < this.BarsOnScreen; i++) {
        trebleNotesXml[i] = [];
        bassNotesXml[i] = [];
      }

      for (let i = 0; i < this._notes.length; i++) {

        note = this._notes[i];

        if (note.instrumentId !== instrument.id) continue;
        if (note.position.bar < this.currentPage * this.BarsOnScreen
          || note.position.bar >= (this.currentPage + 1) * this.BarsOnScreen
          || note.position.bar < 0
          || note.position.bar >= this.BarCount) continue;

        baseNote = this.baseNotes[note.baseNoteId];

        noteXml = `<note xml:id="${note.id}" dur="${note.duration.baseDuration}" oct="${baseNote.octave}" pname="${baseNote.pitchNameLower}" ${baseNote.isAccidental ? 'accid="' + baseNote.name[1] + '"' : '' } />`;
        restXml = `<rest xml:id="rest-${note.id}" dur="${note.duration.baseDuration}" oct="${baseNote.octave}" pname="${baseNote.pitchNameLower}" ${baseNote.isAccidental ? 'accid="' + baseNote.name[1] + '"' : '' }/>`;

        if (baseNote.octave > 3) {
          trebleNotesXml[note.position.bar][note.position.offset] = noteXml;
          bassNotesXml[note.position.bar][note.position.offset] = restXml;
        }
        else {
          trebleNotesXml[note.position.bar][note.position.offset] = restXml;
          bassNotesXml[note.position.bar][note.position.offset] = noteXml;
        }
      }

      notationXML =
        `<?xml version="1.0" encoding="UTF-8"?>
    <?xml-model href="http://music-encoding.org/schema/3.0.0/mei-all.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
    <?xml-model href="http://music-encoding.org/schema/3.0.0/mei-all.rng" type="application/xml" schematypens="http://purl.oclc.org/dsdl/schematron"?>
    <mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="3.0.0">
      <music>
          <body>
                <mdiv>
                  <score>
                      <scoreDef>
                            <staffGrp symbol="brace" label="">
                              <staffDef clef.shape="G" clef.line="2" n="1" lines="5" />
                              <staffDef clef.shape="F" clef.line="4" n="2" lines="5" />
                            </staffGrp>
                      </scoreDef>
                      <section>`;

      for (let i = 0; (i < this.BarsOnScreen) && (this.currentPage * this.BarsOnScreen + i < this.BarCount); i++) {
        if (trebleNotesXml[i].length == 0) {
          let restMeasureXml = `<rest xml:id="rest-${instrument.id}-${i}" dur="1" oct="4" pname="G"/>`;
          trebleNotesXml[i].push(restMeasureXml);
        }
        if (bassNotesXml[i].length == 0) {
          let restMeasureXml = `<rest xml:id="rest-${instrument.id}-${i}" dur="1" oct="2" pname="F"/>`;
          bassNotesXml[i].push(restMeasureXml);
        }
        notationXML += `
                            <measure n="${i + 1}">
                              <staff n="1">
                                  <layer n="1" xml:id="layer-treple">
                                        ${ trebleNotesXml[i].join("") }
                                  </layer>
                              </staff>
                              <staff n="2">
                                  <layer xml:id="layer-bass" n="1">
                                        ${ bassNotesXml[i].join("") }
                                  </layer>
                              </staff>
                            </measure>`
      }

      notationXML += `
                      </section>
                  </score>
                </mdiv>
          </body>
      </music>
    </mei>`;

      let options = {
        pageWidth: this.staffWidth,
        border: 25,
        scale: 50,
        adjustPageHeight: 1
      };

      this.notation[instrument.id] = this.vrvToolkit.renderData(notationXML, options);

    }
  }
}
