export default Convolver;

function Convolver(audioCtx) {
    this.audioCtx = audioCtx;
    this._convolverNode = audioCtx.createConvolver();
}

Convolver.prototype.connect = function (destination) {
    this._convolverNode.connect(destination);
};

Convolver.prototype.getConvolverNode = function () {
    return this._convolverNode;
};