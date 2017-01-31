import {Injectable, OnInit} from "@angular/core";
import {BroadcasterService} from "../broadcaster/broadcaster.service";
import {Note} from "../note/note.model";
import {SequencerService} from "../sequencer/sequencer.service";
import {SequencerNote} from "../sequencer/sequencernote.model";
import {BroadcastTopic} from "../broadcaster/broadcasttopic.enum";

class GainedOscillatorNode extends OscillatorNode{
  gainNode: GainNode;
}

@Injectable()
export class SoundService {
  oscillators: Map<number, GainedOscillatorNode[]> = new Map();
  audioContext: AudioContext;
  noteToStop: SequencerNote;

  inputNode: AudioNode;

  masterGainNode: GainNode;

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
    this.inputNode = this.masterGainNode;

    this.broadcaster.on<SequencerNote>(BroadcastTopic.playNote)
      .subscribe(note => this.playNote(note));
    this.broadcaster.on<SequencerNote>(BroadcastTopic.stopNote)
      .subscribe(note => this.stopNote(note));
    this.broadcaster.on(BroadcastTopic.stop)
      .subscribe(() => this.stop());
  }

  private createOscillators(note: SequencerNote): GainedOscillatorNode[] {
    let oscillators = [];
    let basePitch = note.note.freq;

    for (let oscillator of note.instrument.oscillators) {
      let gainNode = this.audioContext.createGain();
      gainNode.connect(this.inputNode);
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

    //this.enveloper.start();
  };

  /**
   * @param note
   * @param forceStop Don't save the note to stop it later with envelope callback, stop it right now instead.
   */
  stopNote = function (note, forceStop = false) {
    if (!this.isPlaying(note)) return;

    // if the only note is stopped, release the enveloper
    if (this.playingCount == 0 && !forceStop) {
      //this.enveloper.release();
      // the note will be stopped in enveloper's onFinished callback
      // we need to remember currently fading note to stop it
      // if some note will be played before enveloper released
      this.noteToStop = note;
    } else {
      this.setGain(note, 0, true);
      setTimeout(function () {
        this.stopNoteImmediately(note)
      }.bind(this), this.RAMP_STOP_TIME);
    }
  };

  private stopNoteImmediately = function (note: SequencerNote) {
    if (!this.isPlaying(note)) return;

    for (let j = 0; j < note.instrument.oscillators.length; j++) {
      this.oscillators.get(note.id)[j].stop(0);
      this.oscillators.get(note.id)[j].disconnect();
    }
    this.oscillators.delete(note.id);
  };

  stop = function () {
    this.noteToStop = undefined;

    for (let [id, arr] of this.oscillators) {
      for (let osc of arr) {
        osc.stop(0);
        osc.disconnect();
      }
    }
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
  setGain = function (note: SequencerNote, gain: number, ramp: boolean = false) {
    if (!this.isPlaying(note)) return;

    if (!ramp) {
      // set immediately
      for (let j = 0; j < note.instrument.oscillators.length; j++) {
        this.oscillators.get(note.id)[j].gainNode.gain.value = gain * note.instrument.oscillators[j].gain;
      }
    } else {
      // grow gain to 'gain' value in RAMP_STOP_TIME milliseconds
      for (let j = 0; j < note.instrument.oscillators.length; j++) {
        this.oscillators.get(note.id)[j].gainNode.gain.linearRampToValueAtTime(
            gain * note.instrument.oscillators[j].gain,
            this.audioContext.currentTime + this.RAMP_STOP_TIME / 1000.0);
      }
      //console.log(this.audioContext.currentTime + this.RAMP_STOP_TIME / 1000.0);
    }
  };

  isPlaying(note: SequencerNote) {
    return this.playingLocal.has(note.id);
  }
}
