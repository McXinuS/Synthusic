export interface ISoundModifier {
  connect(destination: AudioNode): void;
  disconnect(): void;
  getAudioNode(): AudioNode;
}
