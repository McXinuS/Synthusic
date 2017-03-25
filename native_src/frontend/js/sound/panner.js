export default Panner;

function Panner(audioCtx) {
    this.audioCtx = audioCtx;

    let listener = audioCtx.listener;
    listener.setOrientation(0, 0, -1, 0, 1, 0);

    this._pannerNode = audioCtx.createPanner();
    this._pannerNode.coneInnerAngle = 360;
    this._pannerNode.refDistance = 0.01;
    this._pannerNode.rolloffFactor = 0.01;
    this._pannerNode.setOrientation(0, 0, -1);
    this.changePosition({x: 0, y: 0.3});
}

Panner.prototype.connect = function (destination, pannerField) {
    this._pannerNode.connect(destination);
    pannerField.registerPointChanged(this.changePosition.bind(this));
};

Panner.prototype.changePosition = function (position) {
    this._pannerNode.setPosition(position.x, 0, position.y);
};

Panner.prototype.getPannerNode = function () {
    return this._pannerNode;
};