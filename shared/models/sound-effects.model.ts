export class EnvelopeConfig {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export class PannerConfig {
  // -1 < x < 1
  x: number;
  // 0 < y < 1
  y: number;
}
