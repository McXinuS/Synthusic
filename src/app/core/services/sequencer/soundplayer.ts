import {SequencerService} from '@core/services';
import {SoundService, InstrumentService} from '@core/services';
import {Subject} from 'rxjs';
import {SequencerNote} from '@core/models';
import {NoteDuration, NoteDurationEnum, NotePosition} from '@shared-global/models';
import {Observable} from 'rxjs/Observable';

export class SoundPlayer {

  // TODO differ (or remove) bass and treble

  private readonly ReferenceBpm = 60;
  private readonly BpmDurationConstant = this.ReferenceBpm * 4 * 1000;

  private bpm: number;

  private playerTimeout: number;

  private playing: SequencerNote[] = [];
  private readonly playingSource: Subject<SequencerNote[]> = new Subject<SequencerNote[]>();
  /**
   * Array of playing at the moment notes.
   */
  readonly playing$: Observable<SequencerNote[]> = this.playingSource.asObservable();

  // Notes are divided by instrument
  private notes: SequencerNote[] = [];

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
    this.isPaused = true;

    this.stopAllNotes();
    this.updatePlayingObservable([]);
  }

  play() {
    this.isPaused = false;
    this.playNext();
  }

  pause() {
    if (this.isPaused) return;

    this.isPaused = true;

  }

  stop() {
    this.reset();
  }

  isPlaying(note: SequencerNote) {
    return this.playing.find(n => n.id === note.id);
  }

  /**
   * Start playing notes next to currently playing.
   */
  private playNext() {

    if (this.playerTimeout) {
      clearTimeout(this.playerTimeout);
    }

    if (this.isPaused) return;

    // Stop currently playing notes before staring the next ones.
    this.stopAllNotes();

    const nextNotes: Array<SequencerNote> = this.getNextNotes();

    // Stop if no more notes left
    if (nextNotes.length == 0) {
      this.stop();
      return;
    }

    // Play the notes.
    for (let note of nextNotes) {
      this.playNote(note);
    }

    this.currentPosition = this.getNextPosition();

    // Notify other services/components of currently playing notes.
    this.updatePlayingObservable(nextNotes);

    // Schedule next notes to play
    let timeout = this.noteDurationToMillis(this.playing[0].duration);
    this.playerTimeout = setTimeout(this.playNext.bind(this), timeout);
  }

  private getNextNotes() {
    // Get array of notes to play after current
    return this.getNotesByPosition(this.currentPosition);
  }

  private playNote(note: SequencerNote) {
    if (note == null || note.duration.isInfinite() || this.isPlaying(note)) return;
    this.soundService.playNote(note);
  }

  private stopNote(note: SequencerNote) {
    if (note == null) return;
    this.soundService.stopNote(note);
  }

  /**
   * Stop all notes that playing at the moment.
   */
  private stopAllNotes() {
    for (let note of this.notes) {
      this.stopNote(note);
    }
  }

  private getNotesByPosition(notePosition: NotePosition): SequencerNote[] {
    return this.notes.filter(note => note.position.isEqual(notePosition));
  }

  /**
   * Returns position of the note next to current position.
   * @returns {NotePosition} Next position.
   */
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

  /**
   * Convert duration within NoteDuration object to milliseconds considering BPM.
   * @param {NoteDuration} duration Duration of a note.
   * @returns {number} Interval in milliseconds that coresponds to the duration.
   */
  private noteDurationToMillis(duration: NoteDuration): number {
    // ignore triplet and dot as long as they not implemented in UI
    return this.BpmDurationConstant / this.bpm / duration.baseDuration;
  }

  private updatePlayingObservable(notes: Array<SequencerNote>) {
    this.playing = notes;
    this.playingSource.next(this.playing);
  }

}
