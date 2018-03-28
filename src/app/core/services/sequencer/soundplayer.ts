import {SequencerService} from '@core/services';
import {SoundService, InstrumentService} from '@core/services';
import {Subject} from 'rxjs';
import {SequencerNote} from '@core/models';
import {NoteDuration, NoteDurationEnum, NotePosition} from '@shared-global/models';
import {Observable} from 'rxjs/Observable';

// TODO

export class SoundPlayer {

  // TODO differ (or remove) bass and treble

  private readonly ReferenceBpm = 60;
  private readonly BpmDurationConstant = this.ReferenceBpm * 4 * 1000;

  private bpm: number;

  private readonly playingSource: Subject<SequencerNote[]> = new Subject<SequencerNote[]>();
  private playing: SequencerNote[] = [];
  /**
   * Array of playing at the moment notes.
   */
  readonly playing$: Observable<SequencerNote[]> = this.playingSource.asObservable();

  // Notes are divided by instrument
  private notes: SequencerNote[] = [];
  // Notes that will be played next. A little optimization to reduce play lag when changing note array
  private nextNotes: SequencerNote[];

  isPaused: boolean;

  private currentPosition: NotePosition;

  constructor(private sequencerService: SequencerService,
              private soundService: SoundService) {

    this.sequencerService.notes$.subscribe((notes: SequencerNote[]) => {
      this.notes = notes;
    });

    this.sequencerService.bpm$.subscribe(bpm => this.bpm = bpm);

    this.reset();

  }

  private reset() {
    this.currentPosition = new NotePosition(0, 0);
    this.isPaused = false;

    this.nextNotes = [];

    this.playing = [];
    this.playingSource.next(this.playing);
  }

  play() {
    this.isPaused = false;
    this.prepareNextNotes();
    this.playNext();
  }

  pause() {
    if (this.isPaused) return;

    this.isPaused = true;

  }

  stop() {
    this.reset();
  }

  private playNext() {
    if (this.isPaused) return;

    for (let note of this.nextNotes) {
      this.playNote(note);
    }

    // Update observable
    this.playing = this.nextNotes;
    this.playingSource.next(this.playing);

    this.currentPosition = this.getNextPosition();
    this.nextNotes = this.getNotesByPosition(this.currentPosition);

    // Schedule next notes to play
    let timeout = this.noteDurationToMillis(this.playing[0].duration);
    setTimeout(this.playNext.bind(this), timeout);
  }

  private prepareNextNotes() {
    // Get array of notes to play after current
    this.nextNotes = this.getNotesByPosition(this.currentPosition);
  }

  private playNote(note: SequencerNote) {
    if (note == null || note.duration.isInfinite() || this.isPlaying(note)) return;
    this.soundService.playNote(note);
    // TODO: move this logic to sound service
    setTimeout(this.stopNote.bind(this, note), this.noteDurationToMillis(note.duration));
  }

  private stopNote(note: SequencerNote) {
    if (note == null) return;
    this.soundService.stopNote(note);
  }

  isPlaying(note: SequencerNote) {
    return this.playing.find(n => n.id === note.id);
  }

  private getNotesByPosition(notePosition: NotePosition): SequencerNote[] {
    return this.notes.reduce((res, note) => {
      if (note.position.isEqual(notePosition)) {
        res.push(note);
      }
      return res;
    }, []);
  }

  private getNextPosition(): NotePosition {
    let bar = this.currentPosition.bar;
    let argOffset = this.currentPosition.offset;
    let bestOffset = 9999;

    for (let note of this.notes) {

      let curPos = note.position;

      // Find offset closest to the argument's one in case of some offset is missing
      if (curPos.bar === bar
        && curPos.offset > argOffset
        && curPos.offset < bestOffset) {
        bestOffset = curPos.offset;
      }
    }

    // If no next offset is found, go to next bar
    if (bestOffset === 9999) {
      bar++;
      bestOffset = 0;
    }

    return new NotePosition(bar, bestOffset);
  }

  private noteDurationToMillis(duration: NoteDuration): number {
    // ignore triplet and dot as long as they not implemented in UI
    return this.BpmDurationConstant / this.bpm / duration.baseDuration;
  }

}
