import {EnvelopeConfig, SoundModifier} from '@core/models';
import {} from '@core/models';

enum EnveloperState {
  STATE_STARTED,
  STATE_DECAYING,
  STATE_SUSTAINED,
  STATE_RELEASING,
  STATE_FINISHED
}

export class Enveloper implements SoundModifier {

  private audioCtx: AudioContext;
  private gainNode: GainNode;
  private envelope: EnvelopeConfig;
  private state: EnveloperState = EnveloperState.STATE_FINISHED;
  private funcTimeoutId: number = -1;
  private onFinished: () => void;

  constructor(audioCtx: AudioContext,
              envelope: EnvelopeConfig,
              destination?: AudioNode,
              onFinished?: () => any) {
    this.audioCtx = audioCtx;
    this.gainNode = audioCtx.createGain();
    this.gainNode.gain.value = 0;
    this.envelope = envelope;
    this.onFinished = onFinished;

    if (destination) {
      this.connect(destination);
    }
  }

  connect(destination: AudioNode): void {
    this.gainNode.connect(destination);
  }

  disconnect(): void {
    this.gainNode.disconnect();
  }

  getAudioNode(): AudioNode {
    return this.gainNode;
  }

  updateState(type) {
    switch (type) {
      case EnveloperState.STATE_STARTED:
        this.state = EnveloperState.STATE_STARTED;
        this.cancelStateChange();
        this.changeStateAtTime(EnveloperState.STATE_DECAYING, 1.0, this.envelope.attack);
        break;
      case EnveloperState.STATE_DECAYING:
        this.state = EnveloperState.STATE_DECAYING;
        this.changeStateAtTime(EnveloperState.STATE_SUSTAINED, this.envelope.sustain, this.envelope.decay);
        break;
      case EnveloperState.STATE_SUSTAINED:
        this.state = EnveloperState.STATE_SUSTAINED;
        break;
      case EnveloperState.STATE_RELEASING:
        this.state = EnveloperState.STATE_RELEASING;
        this.cancelStateChange();
        this.changeStateAtTime(EnveloperState.STATE_FINISHED, 0, this.envelope.release);
        break;
      case EnveloperState.STATE_FINISHED:
        this.state = EnveloperState.STATE_FINISHED;
        if (typeof(this.onFinished) == 'function') this.onFinished();
        break;
    }
  };

  changeStateAtTime(newState: EnveloperState, newGain: number, time: number) {
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.getRampTime(0));
    this.gainNode.gain.linearRampToValueAtTime(newGain, this.getRampTime(time));
    this.funcTimeoutId = setTimeout(this.updateState.bind(this, newState), time);
  };

  cancelStateChange() {
    this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
    clearTimeout(this.funcTimeoutId);
  };

  start() {
    this.updateState(EnveloperState.STATE_STARTED);
  };

  release() {
    this.updateState(EnveloperState.STATE_RELEASING);
  };

  onStateUpdated(config?: EnvelopeConfig) {
    if (config) {
      this.envelope = config;
    }
    if (this.state === EnveloperState.STATE_SUSTAINED) {
      this.gainNode.gain.value = this.envelope.sustain;
    }
  }

// converts time from millis to seconds and adds it to the current time
  private getRampTime(time) {
    return this.audioCtx.currentTime + time / 1000.0;
  };
}
