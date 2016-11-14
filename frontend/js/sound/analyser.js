export default Analyser;

function Analyser(parameters) {
    this.audioCtx = parameters.audioCtx;
    this._analyserNode = parameters.audioCtx.createAnalyser();
    this._analyserNode.fftSize = parameters.fftSize;
}

Analyser.prototype.getAnalyserNode = function () {
    return this._analyserNode;
};

Analyser.prototype.getFftSize = function () {
    return this._analyserNode.fftSize;
};

Analyser.prototype.getFrequencyBinCount = function () {
    return this._analyserNode.frequencyBinCount;
};

Analyser.prototype.getFloatFrequencyData = function () {
    var dataArray = createBuffer(this.getFrequencyBinCount(), 'float');
    this._analyserNode.getFloatFrequencyData(dataArray);
    return dataArray;
};

Analyser.prototype.getByteFrequencyData = function () {
    var dataArray = createBuffer(this.getFrequencyBinCount(), 'byte');
    this._analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
};

Analyser.prototype.getFloatTimeDomainData = function () {
    var dataArray = createBuffer(this.getFrequencyBinCount(), 'float');
    this._analyserNode.getFloatTimeDomainData(dataArray);
    return dataArray;
};

Analyser.prototype.getByteTimeDomainData = function () {
    var dataArray = createBuffer(this.getFrequencyBinCount(), 'byte');
    this._analyserNode.getByteTimeDomainData(dataArray);
    return dataArray;
};

function createBuffer(length, type) {
    return type == 'float' ? new Float32Array(length) : new Uint8Array(length);
}