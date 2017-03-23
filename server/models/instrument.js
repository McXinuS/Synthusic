module.exports = function (id, name, oscillators, envelope, panner) {
  this.id = id;
  this.name = name;
  this.oscillators = oscillators;
  this.envelope = envelope;
  this.panner = panner;
};
