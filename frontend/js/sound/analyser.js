export default Analyser;

function Analyser(audioCtx) {
    this.audioCtx = audioCtx;
    this._analyserNode = audioCtx.createAnalyser();
    this._analyserNode.fftSize = __constants.ANALYZER_FFT_SIZE;
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

Analyser.prototype.getRms = function() {
    var buffer = this.getFloatTimeDomainData();

    var sum = 0;
    for (var i=0; i<buffer.length-1; i++){
        var val = buffer[i];
        sum += val*val;
    }
    return Math.sqrt(sum/buffer.length);
};

Analyser.prototype.isClipping = function() {
    var buffer = this.getByteTimeDomainData();
    for (var i=0; i<buffer.length-1; i++){
        if (buffer[i] == 0xFF && buffer[i+1] == 0xFF) return true;
    }
    return false;
};