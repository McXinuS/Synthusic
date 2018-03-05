import {SoundModifier} from '@core/models';

export class Analyser implements SoundModifier {

  audioCtx: AudioContext;
  analyserNode: AnalyserNode;

  readonly FftSize = 2048;

  constructor(audioCtx: AudioContext, destination?: AudioNode) {
    this.audioCtx = audioCtx;
    this.analyserNode = audioCtx.createAnalyser();
    this.analyserNode.fftSize = this.FftSize;

    if (destination) {
      this.connect(destination);
    }
  }

  connect(destination: AudioNode) {
    this.analyserNode.connect(destination);
  }

  disconnect() {
    this.analyserNode.disconnect();
  }

  getAudioNode(): AudioNode {
    return this.analyserNode;
  }

  getFloatFrequencyData(): Float32Array {
    let dataArray = this.createFloat32Buffer(this.getFrequencyBinCount());
    this.analyserNode.getFloatFrequencyData(dataArray);
    return dataArray;
  };

  getByteFrequencyData(): Uint8Array {
    let dataArray = this.createUint8Buffer(this.getFrequencyBinCount());
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  };

  getFloatTimeDomainData(): Float32Array {
    let dataArray = this.createFloat32Buffer(this.getFrequencyBinCount());
    this.analyserNode.getFloatTimeDomainData(dataArray);
    return dataArray;
  };

  getByteTimeDomainData(): Uint8Array {
    let dataArray = this.createUint8Buffer(this.getFrequencyBinCount());
    this.analyserNode.getByteTimeDomainData(dataArray);
    return dataArray;
  };

  getRms (): Number {
    let buffer = this.getFloatTimeDomainData();

    let sum = 0;
    for (let i = 0; i < buffer.length - 1; i++) {
      let val = buffer[i];
      sum += val * val;
    }
    return Math.sqrt(sum / buffer.length);
  };

  isClipping (): Boolean {
    let buffer = this.getByteTimeDomainData();
    for (let i = 0; i < buffer.length - 1; i++) {
      if (buffer[i] == 0xFF && buffer[i + 1] == 0xFF) return true;
    }
    return false;
  };

  private getFftSize() {
    return this.analyserNode.fftSize;
  };

  private getFrequencyBinCount() {
    return this.analyserNode.frequencyBinCount;
  };

  private createFloat32Buffer(length): Float32Array {
    return new Float32Array(length);
  }

  private createUint8Buffer(length): Uint8Array {
    return new Uint8Array(length);
  }
}
