import {Instrument, BaseNote, SequencerNote} from '@core/models';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {NoteService} from '../note';
import {SequencerService} from '../sequencer/sequencer.service';
// import {SoundService} from '../sound';
import {SoundPlayer} from './soundplayer'
import {MeiConverter} from "@core/services/sequencer/mei-converter";
import {ScoreState} from "@core/models/score-state";

// Library that converts generated MEI file to SVG score
// During building this var will magically convert to an object
declare var verovio: any;

@Injectable()
export class StaffService {

  private vrvToolkit = new verovio.toolkit();
  private instruments: Instrument[];
  private notes: SequencerNote[];
  private baseNotes: BaseNote[];

  _state: ScoreState;
  _scoreStateSource: Subject<ScoreState> = new Subject();
  scoreState$: Observable<ScoreState> = this._scoreStateSource.asObservable();

  private notationSource: Subject<Array<string>> = new BehaviorSubject([]);
  notation$: Observable<Array<string>> = this.notationSource.asObservable();

  soundPlayer: SoundPlayer;

  constructor(private noteService: NoteService,
              // private soundService: SoundService,
              private sequencerService: SequencerService) {

    // TODO: play from staff service
    // this.soundPlayer = new SoundPlayer(sequencerService, soundService);
    // this.soundPlayer.onMeasureChanged = this.setPage.bind(this);

    this._state = new ScoreState();

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
    if (!width || width < 320 || width == this._state.staffViewWidth) return;

    this._state.staffViewWidth = width;
    this._state.barsOnScreen = Math.round(width / this._state.EstimatedBarWidth);
    this._state.pageCount = Math.ceil(this._state.BarCount / this._state.barsOnScreen);
    this._state.estimatedStaffWidth = this._state.EstimatedBarWidth * this._state.barsOnScreen;

    this.setPage(0);
    this.render();
  }

  goPrevPage() {
    this.setPage(this._state.currentPage - 1);
  }

  goNextPage() {
    this.setPage(this._state.currentPage + 1);
  }

  private setPage(page: number) {
    if (page < 0
      || page === this._state.currentPage
      || page > this._state.pageCount - 1) {
      return;
    }

    this._state.currentPage = page;
    this._state.canGoPrevPage = this._state.currentPage > 0;
    this._state.canGoNextPage =
      this._state.currentPage < this._state.pageCount - 1
      && this._state.pageCount > 1;

    this._scoreStateSource.next(this._state);

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


  /**
   * Returns array of SVG elements for every instrument
   */
  render() {

    if (!this.instruments || !this.notes) return;

    let notation: Array<string> = [];

    for (let instrument of this.instruments) {

      let meiConverter = new MeiConverter(this.notes, this.baseNotes, this._state);
      let notationXml = meiConverter.getNotation(instrument);

      let options = {
        border: 25,
        scale: 50,
        adjustPageHeight: 1,
        ignoreLayout: true
      };

      notation[instrument.id] = this.vrvToolkit.renderData(notationXml, options);

    }

    this.notationSource.next(notation);
  }

}
