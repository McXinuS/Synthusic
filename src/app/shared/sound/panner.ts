export class Panner {

  private pannerNode: PannerNode;

  constructor(audioCtx: AudioContext, destination: AudioNode) {
    let listener = audioCtx.listener;
    listener.setOrientation(0, 0, -1, 0, 1, 0);

    this.pannerNode = audioCtx.createPanner();
    this.pannerNode.coneInnerAngle = 360;
    this.pannerNode.refDistance = 0.01;
    this.pannerNode.rolloffFactor = 0.01;
    this.pannerNode.setOrientation(0, 0, -1);
    this.changePosition({x: 0, y: 0.3});

    this.pannerNode.connect(destination);
  }

  changePosition(position) {
    this.pannerNode.setPosition(position.x, 0, position.y);
  }

  getAudioNode() {
    return this.pannerNode;
  }
}
