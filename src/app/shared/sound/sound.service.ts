import {Injectable, OnInit} from "@angular/core";
import {BroadcasterService} from "../broadcaster/broadcaster.service";
import {Note} from "../note/note.model";
import {SequencerService} from "../sequencer/sequencer.service";
import {SequencerNote} from "../sequencer/sequencernote.model";
import {BroadcastTopic} from "../broadcaster/broadcasttopic.enum";
import {Enveloper} from "./enveloper";
import {Instrument} from "../instrument/instrument.model";

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
  private get playingLocal(): Map<number, GainedOscillatorNode[]> {
    return this.oscillators;
  }
  private get playingCountLocal(): number {
    return this.oscillators.size;
  }

  /**
   * Array of notes, playing in sequencer.
   */
  private get playingGlobal(): number[] {
    return this.sequencerService.playing;
  }
  private get playingCountGlobal(): number {
    return this.sequencerService.playingCount;
  }

  /**
   * Prevents click effect when changing one note to another.
   * When stopped, every note will be fading during that period of time (ms).
   */
  readonly RAMP_STOP_TIME = 50;

  constructor(private broadcaster: BroadcasterService,
              private sequencerService: SequencerService) {
  }

  init() {
    this.audioContext = new AudioContext();
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);

    this.broadcaster.on<SequencerNote>(BroadcastTopic.playNote)
      .subscribe(note => this.playNote(note));
    this.broadcaster.on<SequencerNote>(BroadcastTopic.stopNote)
      .subscribe(note => this.stopNote(note));
    this.broadcaster.on(BroadcastTopic.stop)
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

    if (!this.isPlaying(note)) {
      this.oscillators.set(note.id, this.createOscillators(note));
      this.setGain(note, 1, true);
    }

    this.envelopers.get(note.instrument.id).start();
  };

  /**
   * @param note
   * @param forceStop Don't save the note to stop it later with envelope callback, stop it right now instead.
   */
  stopNote(note: SequencerNote, forceStop: boolean = false) {
    if (!this.isPlaying(note)) return;

    // if the only note is stopped, release the enveloper
    if (this.playingCountGlobal == 0 && !forceStop) {
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
    if (!this.isPlaying(note)) return;

    for (let j = 0; j < note.instrument.oscillators.length; j++) {
      this.oscillators.get(note.id)[j].stop(0);
      this.oscillators.get(note.id)[j].disconnect();
    }
    this.oscillators.delete(note.id);
  };

  stop(instrumentId?: number) {
    this.noteToStop = undefined;

    this.oscillators.forEach((oscArr: GainedOscillatorNode[], id: number) => {
      for (let osc of oscArr) {
        osc.stop(0);
        osc.disconnect();
      }
    });
    this.oscillators.clear();
  };


  getGain(note: SequencerNote) {
    if (!this.isPlaying(note)) return 0;
    return this.oscillators.get(note.id)[0].gainNode.gain.value / note.instrument.oscillators[0].gain;
  };

  /**
   If ramp is set to false, set the note's gain immediately
   Otherwise, set it in RAMP_STOP_TIME to prevent click effect
   */
  setGain(note: SequencerNote, targetGain: number, ramp: boolean = false) {
    if (!this.isPlaying(note)) return;

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

  isPlaying(note: SequencerNote) {
    return this.playingLocal.has(note.id);
  }

  private createEnvelope(instrument: Instrument): Enveloper {
    let enveloper = new Enveloper(this.audioContext, instrument.envelope, () => this.stop(instrument.id));
    enveloper.connect(this.masterGainNode);
    return enveloper;
  }
}
