import {Instrument} from "../instrument/instrument.model";
import {BaseNote} from "../note/note.model";
import {SequencerNote} from "./sequencernote.model";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Injectable} from "@angular/core";
import {NoteService} from "../note/note.service";
import {InstrumentService} from "../instrument/instrument.service";
import {SequencerService} from "./sequencer.service";

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

  constructor(private instrumentService: InstrumentService,
              private noteService: NoteService,
              private sequencerService: SequencerService) {
    this.baseNotes = this.noteService.notes;

    this.instrumentService.instruments$.subscribe(instruments => {
      this.instruments = instruments;
      this.render();
    });

    this.sequencerService.notes$.subscribe(notes => {
      this.notes = notes;
      this.render();
    });
  }

  onResize(width: number) {
    if (!width || width < 320) return;

    this.currentPage = 0;
    this.staffViewWidth = width;
    this.barsOnScreen = Math.round(width / this.EstimatedBarWidth);
    this.pageCount = Math.ceil(this.BarCount / this.barsOnScreen);
    this.estimatedStaffWidth = this.EstimatedBarWidth * this.barsOnScreen;
    this.onPageChanged();
    this.render();
  }

  goPrevPage() {
    if (this.currentPage <= 0) return;

    this.currentPage--;
    if (this.currentPage < 0) {
      this.currentPage = 0;
    }

    this.onPageChanged();
  }

  goNextPage() {
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
    this.render();
  }

  /**
   * Returns SVG elements for every instrument
   */
  render() {

    if (!this.instruments && this.barsOnScreen == 0) return;

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

      notation[instrument.id] = this.vrvToolkit.renderData(notationXML, options);

    }

    this.notationSource.next(notation);
  }

}