import {PannerConfig, SoundModifier} from '@core/models';

export class Panner implements SoundModifier{

  private pannerNode: PannerNode;

  constructor(audioCtx: AudioContext, panner: PannerConfig, destination?: AudioNode) {
    let listener = audioCtx.listener;
    listener.setOrientation(0, 0, -1, 0, 1, 0);

    this.pannerNode = audioCtx.createPanner();
    this.pannerNode.coneInnerAngle = 360;
    this.pannerNode.refDistance = 0.01;
    this.pannerNode.rolloffFactor = 0.01;
    this.pannerNode.setOrientation(0, 0, -1);
    this.changePosition(panner);

    if (destination){
      this.connect(destination);
    }
  }

  connect(destination: AudioNode): void {
    this.pannerNode.connect(destination);
  }

  disconnect(){
    this.pannerNode.disconnect();
  }

  getAudioNode() {
    return this.pannerNode;
  }

  changePosition(position: PannerConfig) {
    this.pannerNode.setPosition(position.x, 0, position.y);
  }
}
