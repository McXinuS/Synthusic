import {Injectable} from '@angular/core';
import {SequencerNote} from '../sequencer/sequencernote.model';
import {Enveloper} from './enveloper';
import {Instrument} from '../instrument/instrument.model';
import {SequencerNoteService} from '../sequencer/sequencernote.service';
import {BehaviorSubject} from 'rxjs';

class GainedOscillatorNode extends OscillatorNode {
  gainNode: GainNode;
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
   * Contains enveloper gain nodes for every instrument.
   */
  private envelopers: Map<number, Enveloper> = new Map();

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

  constructor(private sequencerNoteService: SequencerNoteService) {
    this.audioContext = new AudioContext();
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);
  }

  init(masterGain: number) {
    this.masterGain = masterGain;
  }

  private createOscillators(note: SequencerNote): GainedOscillatorNode[] {
    let inputNode;
    if (!this.envelopers.has(note.instrument.id)) {
      let enveloper = this.createEnvelope(note.instrument);
      this.envelopers.set(note.instrument.id, enveloper);
      inputNode = enveloper.getGainNode();
    } else {
      inputNode = this.envelopers.get(note.instrument.id).getGainNode();
    }

    let oscillators = [];
    let basePitch = note.note.freq;
    for (let oscillator of note.instrument.oscillators) {
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
    let noteToStop = this.notesToStop.get(note.instrument.id);
    if (noteToStop && noteToStop.id != note.id) {
      this.stopNote(noteToStop, true);
      this.notesToStop.delete(note.instrument.id);
    }

    if (!this.hasOscillator(note)) {
      this.oscillators.set(note.id, this.createOscillators(note));
      this.setGain(note, 1, true);
      this.playingNotes.getValue().push(note);
      this.playingNotes.next(this.playingNotes.getValue());
    }

    this.envelopers.get(note.instrument.id).start();
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

    // if the only note is stopped, release the enveloper
    if (!forceStop && !this.isInstrumentPlaying(note.instrument)) {
      this.envelopers.get(note.instrument.id).release();
      this.notesToStop.set(note.instrument.id, note);
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
      if ((typeof instrumentId != 'number') || (instrumentId && this.sequencerNoteService.hasInstrumentPreffix(instrumentId, id))) {
        for (let osc of oscArr) {
          osc.stop(0);
          osc.disconnect();
        }
        this.oscillators.delete(id);
      }
    });

    if (instrumentId) {
      this.notesToStop.delete(instrumentId);
      let pl = this.playingNotes.getValue().filter(sn => sn.instrument.id != instrumentId);
      this.playingNotes.next(pl);
    } else {
      this.notesToStop.clear();
      this.playingNotes.next([]);
    }
  };


  getGain(note: SequencerNote) {
    if (!this.hasOscillator(note)) return 0;
    return this.oscillators.get(note.id)[0].gainNode.gain.value / note.instrument.oscillators[0].gain;
  };

  /**
   If ramp is set to false, set the note's gain immediately
   Otherwise, set it in RAMP_STOP_TIME to prevent click effect
   */
  setGain(note: SequencerNote, targetGain: number, ramp: boolean = false) {
    if (!this.hasOscillator(note)) return;

    let oscArr = this.oscillators.get(note.id);
    let gain;
    let rampTime = this.audioContext.currentTime + this.RAMP_STOP_TIME / 1000.0;

    for (let j = 0; j < note.instrument.oscillators.length; j++) {
      gain = targetGain * note.instrument.oscillators[j].gain;
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

  private isInstrumentPlaying(instrument: Instrument) {
    return this.playingNotes.getValue().findIndex(n => instrument.id == n.instrument.id) != -1;
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

  private createEnvelope(instrument: Instrument): Enveloper {
    let enveloper = new Enveloper(this.audioContext,
      instrument.envelope,
      function () {
        this.stop(instrument.id);
      }.bind(this));
    enveloper.connect(this.masterGainNode);
    return enveloper;
  }
}
