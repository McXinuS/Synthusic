import {SequencerService} from '@core/services';
import {SoundService, InstrumentService} from '@core/services';
import {Subject} from 'rxjs';
import {SequencerNote} from '@core/models';

// TODO

export class SoundPlayer {

  private _playing: SequencerNote[] = [];
  /**
   * Array of notes that playing at the moment.
   */
  playing$: Subject<number[]>;

  /**
   * Notes are divided by instrument.
   */
  private notes: Array<SequencerNote> = [];

  isPaused: boolean;
  measure: number;
  bpm: number;
  onMeasurePlayed: (measure: number) => any;

  constructor(private sequencerService: SequencerService,
              private soundService: SoundService) {

    this.isPaused = false;

    this.sequencerService.notes$.subscribe((notes: SequencerNote[]) => {
      this.notes = notes;
    });

    this.sequencerService.bpm$.subscribe((bpm: number) => {
      this.bpm = bpm;
    })

  }

  play() {
    this.isPaused = false;
  }

  pause() {
    if (this.isPaused) return;

    this.isPaused = true;

  }

  stop() {

  }

  private playNote(note: SequencerNote) {
    if (note == null || note.duration.isInfinite() || this.isPlaying(note)) return;
    this._playing.push(note);
    this.soundService.playNote(note);
    setTimeout(this.stopNote.bind(this, note), this.noteDurationToMillis(note));
  }

  private stopNote(note: SequencerNote) {
    if (note == null || this.isPlaying(note)) return;

    let noteIndex = this._playing.findIndex(n => n.id === note.id);
    if (noteIndex < 0)  return;
    this._playing.splice(noteIndex, 1);
    this.soundService.stopNote(note);
  }

  isPlaying(note: SequencerNote) {
    return this._playing.find(n => n.id === note.id );
  }

  private playMeasure(measure: number) {
    this.measure = measure;



    if (typeof this.onMeasurePlayed == 'function') this.onMeasurePlayed(measure);
  }

  private readonly ReferenceBpm = 60;
  private readonly BpmDurationConstant = this.ReferenceBpm * 4 * 1000;

  private noteDurationToMillis(note: SequencerNote): number {
    // ignore triplet and dot as long as they not implemented in UI
    return this.BpmDurationConstant / this.bpm / note.duration.baseDuration;
  }

}
