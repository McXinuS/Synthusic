import {Instrument, SequencerNote} from "@shared-global/models";
import {BaseNote, ScoreState} from "@core/models";

class MeiNotes {
  treble: Array<Array<string>>;
  bass: Array<Array<string>>;

  constructor(barCount: number) {
    this.treble = [];
    this.bass = [];

    for (let i = 0; i < barCount; i++) {
      this.treble[i] = [];
      this.bass[i] = [];
    }
  }
}

export class MeiConverter {

  private notes: SequencerNote[];
  private baseNotes: BaseNote[];
  private state: ScoreState;

  constructor(notes: SequencerNote[],
              baseNotes: BaseNote[],
              scoreState: ScoreState) {

    this.notes = notes;
    this.baseNotes = baseNotes;
    this.state = scoreState;
  }

  private processNotes(instrument: Instrument): MeiNotes {
    let mn = new MeiNotes(this.state.BarCount);

    for (let i = 0; i < this.notes.length; i++) {

      let note = this.notes[i];
      let baseNote = this.baseNotes[note.baseNoteId];

      if (note.instrumentId !== instrument.id) continue;
      if (note.position.bar < this.state.currentPage * this.state.barsOnScreen
        || note.position.bar >= (this.state.currentPage + 1) * this.state.barsOnScreen
        || note.position.bar < 0
        || note.position.bar >= this.state.BarCount) continue;

      let noteXml = this.createMeiNote(note, baseNote);

      if (baseNote.octave > 3) {
        mn.treble[note.position.bar].push(noteXml);
      } else {
        mn.bass[note.position.bar].push(noteXml);
      }
    }

    return mn;
  }

  /**
   * Fill every bar having no notes with rests.
   * Mutates source arrays.
   */
  private completeBars(meiNotes: MeiNotes,
                       instrument: Instrument) {

    let currentBar = this.state.currentPage * this.state.barsOnScreen;

    for (let screenBar = 0; (screenBar < this.state.barsOnScreen) && (currentBar < this.state.BarCount); screenBar++, currentBar++) {

      let restMeasureXml;

      // Create treble rest for current bar
      if (meiNotes.treble[screenBar].length == 0) {
        restMeasureXml = `<rest xml:id="rest-${instrument.id}-${currentBar}" dur="1" oct="4" pname="G"/>`;
        meiNotes.treble[screenBar].push(restMeasureXml);
      }

      // Create bass rest for current bar
      if (meiNotes.bass[screenBar].length == 0) {
        restMeasureXml = `<rest xml:id="rest-${instrument.id}-${currentBar}" dur="1" oct="2" pname="F"/>`;
        meiNotes.bass[screenBar].push(restMeasureXml);
      }
    }
  }

  private createMeiNote(note: SequencerNote, baseNote: BaseNote): string {

    let accidental = '';
    if (baseNote.isAccidental)
      accidental = 'accid="' + baseNote.name[1] + '"';

    return '<note xml:id="' + note.id
      + '" dur="' + note.duration.baseDuration
      + '" oct="' + baseNote.octave
      + '" pname="' + baseNote.pitchNameLower
      + '"' + accidental + '/>';
  }

  private createNotation(meiNotes: MeiNotes): string {

    // Initialize header
    let notation =
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

    let currentBar = this.state.currentPage * this.state.barsOnScreen;

    for (let screenBar = 0; (screenBar < this.state.barsOnScreen) && (currentBar < this.state.BarCount); screenBar++, currentBar++) {

      notation += `
                            <measure n="${currentBar + 1}">
                              <staff n="1">
                                  <layer n="1" xml:id="layer-treple">
                                        ${ meiNotes.treble[screenBar].join('') }
                                  </layer>
                              </staff>
                              <staff n="2">
                                  <layer xml:id="layer-bass" n="1">
                                        ${ meiNotes.bass[screenBar].join('') }
                                  </layer>
                              </staff>
                            </measure>`
    }

    notation += `
                      </section>
                  </score>
                </mdiv>
          </body>
      </music>
    </mei>`;

    return notation;
  }

  /**
   * Generated score page in MEI format for specified instrument using initial notes and score state.
   * @param {Instrument} instrument
   * @returns {string} Music score page in MEI format
   */
  public getNotation(instrument: Instrument) {

    let meiNotes = this.processNotes(instrument);
    this.completeBars(meiNotes, instrument);

    return this.createNotation(meiNotes);

  }
}
