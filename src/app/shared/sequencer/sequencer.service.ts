import {Injectable, OnInit} from '@angular/core';
import {SequencerNote} from './sequencernote.model';
import {SequencerNoteService} from './sequencernote.service';
import {SoundService} from '../sound/sound.service';
import {WebSocketService} from '../websocket/websocket.service';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';
import {BehaviorSubject, Observable, Subject} from "rxjs";
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
  private notationSource: Subject<Array<string>> = new BehaviorSubject(this.notation);
  notation$: Observable<Array<string>>;
  instruments: Instrument[];
  baseNotes: BaseNote[];

  readonly BarCount = 20;
  readonly EstimatedBarWidth = 210;
  staffViewWidth: number;
  barsOnScreen: number;
  pageCount: number;
  estimatedStaffWidth: number;
  currentPage: number = 0;
  canGoPrevPage: boolean = false;
  canGoNextPage: boolean = true;

  constructor(private instrumentService: InstrumentService,
              private noteService: NoteService,
              private sequencerNoteService: SequencerNoteService,
              private soundService: SoundService,
              private webSocketService: WebSocketService) {
    this.onStaffResize(10000);
    this.notation$ = this.notationSource.asObservable();
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

  onStaffResize(staffViewWidth: number) {
    this.currentPage = 0;
    this.staffViewWidth = staffViewWidth;
    this.barsOnScreen = Math.round(staffViewWidth / this.EstimatedBarWidth);
    this.pageCount = Math.ceil(this.BarCount / this.barsOnScreen);
    this.estimatedStaffWidth = this.EstimatedBarWidth * this.barsOnScreen;
    this.onPageChanged();
    this.renderNotation();
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
    if (this.currentPage >= this.pageCount - 1) return;

    this.currentPage++;
    if (this.currentPage > this.pageCount - 1) {
      this.currentPage = this.pageCount - 1;
    }

    this.onPageChanged();
  }

  private onPageChanged() {
    this.canGoPrevPage = this.currentPage > 0;
    this.canGoNextPage = this.currentPage < this.pageCount - 1 && this.pageCount - 1 > 0;
    this.renderNotation();
  }

  renderNotation() {

    if (!this.instruments) return;

    let note: SequencerNote,
      baseNote: BaseNote,
      noteXml,
      restXml,
      restMeasureXml,
      trebleNotesXml: Array<Array<string>>,
      bassNotesXml: Array<Array<string>>,
      options,
      notationXML;

    for (let instrument of this.instruments) {

      trebleNotesXml = [];
      bassNotesXml = [];
      for (let i = 0; i < this.barsOnScreen; i++) {
        trebleNotesXml[i] = [];
        bassNotesXml[i] = [];
      }

      for (let i = 0; i < this._notes.length; i++) {

        note = this._notes[i];

        if (note.instrumentId !== instrument.id) continue;
        if (note.position.bar < this.currentPage * this.barsOnScreen
          || note.position.bar >= (this.currentPage + 1) * this.barsOnScreen
          || note.position.bar < 0
          || note.position.bar >= this.BarCount) continue;

        baseNote = this.baseNotes[note.baseNoteId];

        noteXml = `<note xml:id="${note.id}" dur="${note.duration.baseDuration}" oct="${baseNote.octave}" pname="${baseNote.pitchNameLower}" ${baseNote.isAccidental ? 'accid="' + baseNote.name[1] + '"' : '' } />`;
        // restXml = `<rest xml:id="rest-${note.id}" dur="${note.duration.baseDuration}" oct="${baseNote.octave}" pname="${baseNote.pitchNameLower}" ${baseNote.isAccidental ? 'accid="' + baseNote.name[1] + '"' : '' }/>`;

        if (baseNote.octave > 3) {
          trebleNotesXml[note.position.bar].push(noteXml);
          // bassNotesXml[note.position.bar][note.position.offset] = restXml;
        }
        else {
          // trebleNotesXml[note.position.bar][note.position.offset] = restXml;
          bassNotesXml[note.position.bar].push(noteXml);
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

      for (let i = 0,
             p = this.currentPage * this.barsOnScreen; (i < this.barsOnScreen) && (p < this.BarCount); i++, p++) {
        if (trebleNotesXml[i].length == 0) {
          restMeasureXml = `<rest xml:id="rest-${instrument.id}-${p}" dur="1" oct="4" pname="G"/>`;
          trebleNotesXml[i].push(restMeasureXml);
        }
        if (bassNotesXml[i].length == 0) {
          restMeasureXml = `<rest xml:id="rest-${instrument.id}-${p}" dur="1" oct="2" pname="F"/>`;
          bassNotesXml[i].push(restMeasureXml);
        }
        notationXML += `
                            <measure n="${p + 1}">
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

      options = {
        border: 25,
        scale: 50,
        adjustPageHeight: 1,
        ignoreLayout: true
      };

      this.notation[instrument.id] = this.vrvToolkit.renderData(notationXML, options);

    }

    this.notationSource.next(this.notation);
  }
}
