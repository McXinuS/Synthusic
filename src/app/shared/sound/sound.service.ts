import {Injectable} from '@angular/core';
import {SequencerNote} from '../sequencer/sequencernote.model';
import {Enveloper} from './enveloper';
import {Instrument} from '../instrument/instrument.model';
import {SequencerNoteService} from '../sequencer/sequencernote.service';
import {BehaviorSubject} from 'rxjs';
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

  /**
   * Array of notes, playing in the sound module.
   */
  playingNotes: BehaviorSubject<Array<SequencerNote>> = new BehaviorSubject([]);

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
              private instrumentService: InstrumentService,
              private noteService: NoteService) {
    this.audioContext = new AudioContext();
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);

    this.instrumentService.instruments$.subscribe(instruments => {
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
      this.playingNotes.getValue().push(note);
      this.playingNotes.next(this.playingNotes.getValue());
    }

    this.getEnveloper(note.instrumentId).start();
  };

  /**
   * @param note
   * @param forceStop Don't save the note to stop it later with envelope callback, stop it right now instead.
   */
  stopNote(note: SequencerNote, forceStop: boolean = false) {
    if (!this.hasOscillator(note)) return;

    if (this.isPlaying(note)) {
      let newNotesArray = this.playingNotes.getValue(),
        ind = newNotesArray.findIndex(n => note.id == n.id);
      if (ind != -1) {
        newNotesArray.splice(ind, 1);
        this.playingNotes.next(newNotesArray);
      }
    }

    if (!forceStop && !this.isInstrumentPlaying(note.instrumentId)) {
      // if the only note is stopped, release the enveloper
      this.getEnveloper(note.instrumentId).release();
      this.notesToStop.set(note.instrumentId, note);
    } else {
      this.setGain(note, 0, true);
      setTimeout(() => this.stopNoteImmediately(note), this.RAMP_STOP_TIME);
    }
  };

  private stopNoteImmediately(note: SequencerNote) {
    if (!this.hasOscillator(note)) return;

    let oscArr = this.oscillators.get(note.id);
    for (let j = oscArr.length - 1; j >= 0; j--) {
      oscArr[j].stop(0);
      oscArr[j].disconnect();
    }
    this.oscillators.delete(note.id);
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
      let pl = this.playingNotes.getValue().filter(sn => sn.instrumentId !== instrumentId);
      this.playingNotes.next(pl);
    } else {
      this.notesToStop.clear();
      this.playingNotes.next([]);
    }
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

  private hasOscillator(note: SequencerNote) {
    return this.oscillators.has(note.id);
  }

  private isPlaying(note: SequencerNote) {
    return this.playingNotes.getValue().findIndex(n => note.id == n.id) != -1;
  }

  private isInstrumentPlaying(instrumentId: number) {
    return this.playingNotes.getValue().findIndex(n => instrumentId == n.instrumentId) != -1;
    /*
     let found = false;
     this.oscillators.forEach((o,n) => {
     if (this.sequencerNoteService.hasInstrumentPreffix(instrument.id, n)) {
     found = true;
     return;
     }
     });
     return found;
     */
  }

  private createInstrumentModifiers(instrument: Instrument, destination: AudioNode): InstrumentModifiers {
    let panner = this.createPanner(instrument, destination);
    return new InstrumentModifiers(
      this.createEnveloper(instrument, panner.getAudioNode()),
      panner
    );
  }

  // TODO: add panner settings to instrument model
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

  private getInstrument(instrumentId: number) {
    return this.instrumentService.getInstrument(instrumentId);
  }

  private getEnveloper(instrumentId: number) {
    let mod = this.modifiers.get(instrumentId);
    return mod ? mod.enveloper : null;
  }

  getPanner(instrumentId: number) {
    let mod = this.modifiers.get(instrumentId);
    return mod ? mod.panner : null;
  }
}
