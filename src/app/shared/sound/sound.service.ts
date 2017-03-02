import {Injectable} from '@angular/core';
import {BroadcasterService} from '../broadcaster/broadcaster.service';
import {SequencerNote} from '../sequencer/sequencernote.model';
import {BroadcastTopic} from '../broadcaster/broadcasttopic.enum';
import {Enveloper} from './enveloper';
import {Instrument} from '../instrument/instrument.model';
import {SequencerNoteService} from '../sequencer/sequencernote.service';
import {BehaviorSubject} from 'rxjs';

class GainedOscillatorNode extends OscillatorNode{
  gainNode: GainNode;
}

@Injectable()
export class SoundService {
  oscillators: Map<number, GainedOscillatorNode[]> = new Map();
  audioContext: AudioContext;
  noteToStop: SequencerNote;

  masterGainNode: GainNode;
  /**
   * Contains enveloper gain nodes for every instrument.
   */
  envelopers: Map<number, Enveloper> = new Map();

  get masterGain() {
    return this.masterGainNode.gain.value;
  };

  set masterGain(gain) {
    this.masterGainNode.gain.value = gain;
  };

  get audioAmpBuffer() {
    return [];
    //return this.analyser.getFloatTimeDomainData();
  };

  get audioFreqBuffer() {
    return [];
    //return this.analyser.getByteFrequencyData();
  };

  /**
   * Array of notes, playing in the sound module.
   */
  playingNotes: BehaviorSubject<Array<SequencerNote>> = new BehaviorSubject([]);
  playingCount: number = 0;

  /**
   * Prevents click effect when changing one note to another.
   * When stopped, every note will be fading during that period of time (ms).
   */
  readonly RAMP_STOP_TIME = 10;

  constructor(private broadcaster: BroadcasterService,
              private sequencerNoteService: SequencerNoteService) {
    this.audioContext = new AudioContext();
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);
  }

  init(masterGain: number) {
    this.masterGain = masterGain;

    this.broadcaster.on<SequencerNote>(BroadcastTopic.playNote)
      .subscribe(note => this.playNote(note));
    this.broadcaster.on<SequencerNote>(BroadcastTopic.stopNote)
      .subscribe(note => this.stopNote(note));
    this.broadcaster.on(BroadcastTopic.stopAllTotes)
      .subscribe(() => this.stop());
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
    if (this.noteToStop != undefined && this.noteToStop.id != note.id) {
      this.stopNote(this.noteToStop, true);
      this.noteToStop = undefined;
    }

    if (!this.hasOscillator(note)) {
      this.playingCount++;
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
      this.playingCount--;
      let newNotesArray = this.playingNotes.getValue(),
        ind = newNotesArray.findIndex(n => note.id == n.id);
      if (ind != -1) {
        newNotesArray.splice(ind, 1);
        this.playingNotes.next(newNotesArray);
      }
    }

    // if the only note is stopped, release the enveloper
    if (this.playingCount == 0 && !forceStop) {
      this.envelopers.get(note.instrument.id).release();
      // the note will be stopped in enveloper's onFinished callback
      // we need to remember currently fading note to stop it
      // if some note will be played before enveloper released
      this.noteToStop = note;
    } else {
      this.setGain(note, 0, true);
      setTimeout(() => this.stopNoteImmediately(note), this.RAMP_STOP_TIME);
    }
  };

  private stopNoteImmediately(note: SequencerNote) {
    if (!this.hasOscillator(note)) return;

    for (let j = 0; j < note.instrument.oscillators.length; j++) {
      this.oscillators.get(note.id)[j].stop(0);
      this.oscillators.get(note.id)[j].disconnect();
    }
    this.oscillators.delete(note.id);
  };

  stop(instrumentId?: number) {
    this.noteToStop = undefined;

    this.oscillators.forEach((oscArr: GainedOscillatorNode[], id: number) => {
      if (instrumentId && this.sequencerNoteService.hasPreffix(instrumentId, id)) return;
      for (let osc of oscArr) {
        osc.stop(0);
        osc.disconnect();
      }
    });
    this.oscillators.clear();

    if (instrumentId) {
      let pl = this.playingNotes.getValue().filter(sn => sn.instrument.id != instrumentId);
      this.playingNotes.next(pl);
      this.playingCount = pl.length;
    } else {
      this.playingNotes.next([]);
      this.playingCount = 0;
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

  hasOscillator(note: SequencerNote) {
    return this.oscillators.has(note.id);
  }

  isPlaying(note: SequencerNote) {
    return this.playingNotes.getValue().findIndex(n => note.id == n.id) != -1;
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
