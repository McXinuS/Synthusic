export interface SoundModifier {
  connect(destination: AudioNode): void;
  disconnect(): void;
  getAudioNode(): AudioNode;
}
