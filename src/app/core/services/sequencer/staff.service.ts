import {Instrument, BaseNote, SequencerNote} from '@core/models';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {NoteService} from '../note';
import {SequencerService} from './sequencer.service';
import {SoundService} from '../sound';
import {SoundPlayer} from './soundplayer'

// Library that converts generated MEI file to SVG score
// During building this var will magically convert to an object
declare var verovio: any;

@Injectable()
export class StaffService {

  private vrvToolkit = new verovio.toolkit();
  private instruments: Instrument[];
  private notes: SequencerNote[];
  private baseNotes: BaseNote[];

  private readonly BarCount = 20;
  private staffViewWidth: number;

  private barsOnScreen: number = 0;
  private readonly EstimatedBarWidth = 210;
  private estimatedStaffWidth: number;

  pageCount: number;
  currentPage: number = 0;
  canGoPrevPage: boolean = false;
  canGoNextPage: boolean = true;

  private notationSource: Subject<Array<string>> = new BehaviorSubject([]);
  notation$: Observable<Array<string>> = this.notationSource.asObservable();

  soundPlayer: SoundPlayer;
  playing$: Observable<SequencerNote[]>;  // notes that are paying in the sound player

  constructor(private noteService: NoteService,
              private soundService: SoundService,
              private sequencerService: SequencerService) {

    this.soundPlayer = new SoundPlayer(sequencerService, soundService);
    this.playing$ = this.soundPlayer.playing$;

    this.baseNotes = this.noteService.notes;

    this.sequencerService.notes$.subscribe(notes => {
      this.notes = notes;
      this.render();
    });
  }

  setInstrumentObservable(observable: Observable<Array<Instrument>>) {
    observable.subscribe(instruments => {
      this.instruments = instruments;
      this.render();
    });
  }

  onResize(width: number) {
    if (!width || width < 320 || width == this.staffViewWidth) return;

    this.currentPage = 0;
    this.staffViewWidth = width;
    this.barsOnScreen = Math.round(width / this.EstimatedBarWidth);
    this.pageCount = Math.ceil(this.BarCount / this.barsOnScreen);
    this.estimatedStaffWidth = this.EstimatedBarWidth * this.barsOnScreen;

    this.canGoPrevPage = this.currentPage > 0;
    this.canGoNextPage = this.currentPage < this.pageCount - 1 && this.pageCount > 1;
    this.render();
  }

  goPrevPage() {
    this.setPage(this.currentPage - 1);
  }

  goNextPage() {
    this.setPage(this.currentPage + 1);
  }

  private setPage(page: number) {
    if (page < 0 || page === this.currentPage || page > this.pageCount - 1) return;

    this.currentPage = page;
    this.canGoPrevPage = this.currentPage > 0;
    this.canGoNextPage = this.currentPage < this.pageCount - 1 && this.pageCount > 1;
    this.render();
  }

  play() {
    this.soundPlayer.play();
  }

  pause() {
    this.soundPlayer.pause();
  }

  stop() {
    this.soundPlayer.stop();
  }

  private createMeiNote(note: SequencerNote, baseNote: BaseNote) {

    let accidental = '';
    if (baseNote.isAccidental)
      accidental = 'accid="' + baseNote.name[1] + '"';

    return '<note xml:id="' + note.id
                 + '" dur="' + note.duration.baseDuration
                 + '" oct="' + baseNote.octave
                 + '" pname="' + baseNote.pitchNameLower
                 + '"' + accidental + '/>';
  }

  /**
   * Returns SVG elements for every instrument
   */
  render() {

    if (!this.instruments || !this.notes || this.barsOnScreen == 0) return;

    let notation: Array<string> = [];
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

      for (let i = 0; i < this.notes.length; i++) {

        note = this.notes[i];
        baseNote = this.baseNotes[note.baseNoteId];

        if (note.instrumentId !== instrument.id) continue;
        if (note.position.bar < this.currentPage * this.barsOnScreen
          || note.position.bar >= (this.currentPage + 1) * this.barsOnScreen
          || note.position.bar < 0
          || note.position.bar >= this.BarCount) continue;

        noteXml = this.createMeiNote(note, baseNote);
        // restXml = `<rest xml:id="rest-${note.id}" dur="${note.duration.baseDuration}"
        // |  oct="${baseNote.octave}" pname="${baseNote.pitchNameLower}"
        // |  ${baseNote.isAccidental ? 'accid="' + baseNote.name[1] + '"' : '' }/>`;

        if (baseNote.octave > 3) {
          trebleNotesXml[note.position.bar].push(noteXml);
          // bassNotesXml[note.position.bar][note.position.offset] = restXml;
        } else {
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
                                        ${ trebleNotesXml[i].join('') }
                                  </layer>
                              </staff>
                              <staff n="2">
                                  <layer xml:id="layer-bass" n="1">
                                        ${ bassNotesXml[i].join('') }
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

      notation[instrument.id] = this.vrvToolkit.renderData(notationXML, options);

    }

    this.notationSource.next(notation);
  }

}
