import {Injectable} from '@angular/core';
import {SequencerNote} from '../sequencer/sequencernote.model';
import {Enveloper} from './enveloper';
import {EnvelopeConfig, Instrument, Oscillator, PannerConfig} from '../instrument/instrument.model';
import {SequencerNoteService} from '../sequencer/sequencernote.service';
import {BehaviorSubject, Subject, Observable} from 'rxjs';
import {InstrumentService} from "../instrument/instrument.service";
import {NoteService} from "../note/note.service";
import {Panner} from "./panner";

class GainedOscillatorNode extends OscillatorNode {
  gainNode: GainNode;
}

class InstrumentModifiers {
  enveloper: Enveloper;
  panner: Panner;

  constructor(enveloper: Enveloper, panner: Panner) {
    this.enveloper = enveloper;
    this.panner = panner;
  }
}

@Injectable()
export class SoundService {
  private oscillators: Map<number, GainedOscillatorNode[]> = new Map();
  private audioContext: AudioContext;
  /**
   * The note will be stopped in enveloper's onFinished callback.
   * We need to remember currently fading note to stop it
   * if some note will be played before enveloper released.
   */
  private notesToStop: Map<number, SequencerNote> = new Map();

  private masterGainNode: GainNode;
  /**
   * Contains InstrumentModifiers for every instrument.
   */
  private modifiers: Map<number, InstrumentModifiers> = new Map();

  private _playingNotes = [];
  private playingNotesSource: Subject<Array<SequencerNote>> = new BehaviorSubject(this._playingNotes);
  /**
   * Array of notes, playing in the sound module.
   */
  playingNotes$: Observable<Array<SequencerNote>>;

  private instruments = [];
  private instruments$: Observable<Array<Instrument>>;

  get masterGain() {
    return this.masterGainNode.gain.value;
  };

  set masterGain(gain) {
    this.masterGainNode.gain.value = gain;
  };

  /**
   * Prevents click effect when changing one note to another.
   * When stopped, every note will be fading during that period of time (ms).
   */
  private readonly RAMP_STOP_TIME = 10;

  constructor(private sequencerNoteService: SequencerNoteService,
              private noteService: NoteService) {
    this.audioContext = new AudioContext();
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);

    this.playingNotes$ = this.playingNotesSource.asObservable();

  }

  init(masterGain: number) {
    this.masterGain = masterGain;
  }

  private createOscillators(note: SequencerNote): GainedOscillatorNode[] {
    let instrument = this.getInstrument(note.instrumentId),
      baseNote = this.noteService.getNote(note.baseNoteId);

    let inputNode;
    if (!this.modifiers.has(note.instrumentId)) {
      let modifier = this.createInstrumentModifiers(instrument, this.masterGainNode);
      this.modifiers.set(note.instrumentId, modifier);
      inputNode = modifier.enveloper.getAudioNode();
    } else {
      inputNode = this.getEnveloper(note.instrumentId).getAudioNode();
    }

    let oscillators = [];
    let basePitch = baseNote.freq;
    for (let oscillator of instrument.oscillators) {
      let gainNode = this.audioContext.createGain();
      gainNode.connect(inputNode);
      gainNode.gain.value = 0;

      let osc: GainedOscillatorNode = <GainedOscillatorNode>(this.audioContext.createOscillator());
      osc.gainNode = gainNode;
      osc.connect(gainNode);
      osc.type = oscillator.type;
      osc.frequency.value = basePitch * oscillator.freq;
      osc.start(0);

      oscillators.push(osc);
    }

    return oscillators;
  };

  playNote(note: SequencerNote) {
    let noteToStop = this.notesToStop.get(note.instrumentId);
    if (noteToStop && noteToStop.id != note.id) {
      this.stopNote(noteToStop, true);
      this.notesToStop.delete(note.instrumentId);
    }

    if (!this.hasOscillator(note)) {
      this.oscillators.set(note.id, this.createOscillators(note));
      this.setGain(note, 1, true);
      this._playingNotes.push(note);
      this.playingNotesSource.next(this._playingNotes);
    }

    this.getEnveloper(note.instrumentId).start();
  };

  /**
   * @param note
   * @param forceStop Don't save the note to stop it later with envelope callback, stop it right now instead.
   */
  stopNote(note: SequencerNote, forceStop: boolean = false) {
    if (!this.hasOscillator(note)) return;

    let isLastNote = this.getInstrumentNotesCount(note.instrumentId) == 1;

    if (!forceStop && isLastNote) {
      // if the only note is stopped, release the enveloper
      this.getEnveloper(note.instrumentId).release();
      this.notesToStop.set(note.instrumentId, note);
    } else {
      this.setGain(note, 0, true);
      setTimeout(() => this.stopNoteImmediately(note), this.RAMP_STOP_TIME);
    }
  };

  private stopNoteImmediately(note: SequencerNote) {
    if (this.hasOscillator(note)) {
      let oscArr = this.oscillators.get(note.id);
      for (let j = oscArr.length - 1; j >= 0; j--) {
        oscArr[j].stop(0);
        oscArr[j].disconnect();
      }
      this.oscillators.delete(note.id);
    }

    if (this.isPlaying(note)) {
      let ind = this._playingNotes.findIndex(n => note.id == n.id);
      if (ind != -1) {
        this._playingNotes.splice(ind, 1);
        this.playingNotesSource.next(this._playingNotes);
      }
    }
  };

  stop(instrumentId?: number) {
    this.oscillators.forEach((oscArr: GainedOscillatorNode[], id: number) => {
      if (typeof instrumentId != 'number' || this.sequencerNoteService.hasInstrumentPreffix(instrumentId, id)) {
        for (let osc of oscArr) {
          osc.stop(0);
          osc.disconnect();
        }
        this.oscillators.delete(id);
      }
    });

    if (typeof instrumentId == 'number') {
      this.notesToStop.delete(instrumentId);
      for (let i = this._playingNotes.length - 1; i >= 0; i--) {
        if (this._playingNotes[i].instrumentId === instrumentId) {
          this._playingNotes.splice(i, 1);
        }
      }
    } else {
      this.notesToStop.clear();
      this._playingNotes.splice(0, this._playingNotes.length);
    }
    this.playingNotesSource.next(this._playingNotes);
  };


  getGain(note: SequencerNote) {
    if (!this.hasOscillator(note)) return 0;
    let baseGain = this.getInstrument(note.instrumentId).oscillators[0].gain;
    return this.oscillators.get(note.id)[0].gainNode.gain.value / baseGain;
  };

  /**
   If ramp is set to false, set the note's gain immediately
   Otherwise, set it in RAMP_STOP_TIME to prevent click effect
   */
  setGain(note: SequencerNote, targetGain: number, ramp: boolean = false) {
    if (!this.hasOscillator(note)) return;

    let oscArr = this.oscillators.get(note.id),
      instrument = this.getInstrument(note.instrumentId),
      gain,
      rampTime = this.audioContext.currentTime + this.RAMP_STOP_TIME / 1000.0;

    for (let j = 0; j < oscArr.length; j++) {
      gain = targetGain * instrument.oscillators[j].gain;
      if (ramp) {
        oscArr[j].gainNode.gain.linearRampToValueAtTime(gain, rampTime);
      } else {
        oscArr[j].gainNode.gain.value = gain;
      }
    }
  };

  setInstrumentObservable(observable: Observable<Array<Instrument>>) {
    this.instruments$ = observable;
    this.instruments$.subscribe(instruments => {
      this.instruments = instruments;
      for (let instrument of instruments) {
        if (!this.modifiers.has(instrument.id)) {
          this.modifiers.set(
            instrument.id,
            this.createInstrumentModifiers(instrument, this.masterGainNode)
          );
        }
      }
    });
  }

  onInstrumentUpdate(instrumentId: number) {
    let instrument = this.instruments[instrumentId];
    this.onOscillatorsUpdate(instrument.id);
    this.onEnveloperUpdate(instrument.id, instrument.enveloper);
    this.onPannerUpdate(instrument.id, instrument.panner);
  }

  onOscillatorsUpdate(instrumentId: number, oscillator?: Oscillator, oldOscillator?: Oscillator) {
    let freqEqual, gainEqual;
    for (let note of this._playingNotes) {
      if (note.instrumentId === instrumentId) {
        if (!oscillator) {
          this.stopNoteImmediately(note);
          this.playNote(note);
        } else if (oscillator && oldOscillator) {
          for (let osc of this.oscillators.get(note.id)) {
            freqEqual = this.isFloatEqual(
              osc.frequency.value,
              oldOscillator.freq * this.noteService.getNote(note.baseNoteId).freq);
            gainEqual = this.isFloatEqual(
              osc.gainNode.gain.value,
              oldOscillator.gain);
            if (freqEqual && gainEqual && (osc.type === oldOscillator.type)) {
              osc.frequency.value = oscillator.freq * this.noteService.getNote(note.baseNoteId).freq;
              osc.gainNode.gain.value = oscillator.gain;
              osc.type = oscillator.type;
            }
          }
        }
      }
    }
  }

  onEnveloperUpdate(instrumentId: number, enveloper: EnvelopeConfig) {
    this.getEnveloper(instrumentId).onStateUpdated(enveloper);
  }

  onPannerUpdate(instrumentId: number, panner: PannerConfig) {
    this.getPanner(instrumentId).changePosition(panner);
  }

  private hasOscillator(note: SequencerNote): boolean {
    return this.oscillators.has(note.id);
  }

  private isPlaying(note: SequencerNote): boolean {
    return this._playingNotes.findIndex(n => note.id == n.id) != -1;
  }

  private getInstrumentNotesCount(instrumentId: number): number {
    return this._playingNotes.reduce((sum, note) => {
      return note.instrumentId === instrumentId ? sum + 1 : sum;
    }, 0);
  }

  private createInstrumentModifiers(instrument: Instrument, destination: AudioNode): InstrumentModifiers {
    let panner = this.createPanner(instrument, destination);
    return new InstrumentModifiers(
      this.createEnveloper(instrument, panner.getAudioNode()),
      panner
    );
  }

  private createPanner(instrument: Instrument, destination: AudioNode): Panner {
    return new Panner(
      this.audioContext,
      destination,
      instrument.panner
    );
  }

  private createEnveloper(instrument: Instrument, destination: AudioNode): Enveloper {
    return new Enveloper(
      this.audioContext,
      destination,
      instrument.envelope,
      function () {
        this.stop(instrument.id);
      }.bind(this));
  }

  private getInstrument(instrumentId: number): Instrument {
    return this.instruments.find(ins => ins.id === instrumentId);
  }

  private getEnveloper(instrumentId: number): Enveloper {
    let mod = this.modifiers.get(instrumentId);
    return mod ? mod.enveloper : null;
  }

  private getPanner(instrumentId: number): Panner {
    let mod = this.modifiers.get(instrumentId);
    return mod ? mod.panner : null;
  }

  readonly CompareEps = 0.01;

  private isFloatEqual(a: number, b: number): boolean {
    return Math.abs(a - b) < this.CompareEps;
  }
}
