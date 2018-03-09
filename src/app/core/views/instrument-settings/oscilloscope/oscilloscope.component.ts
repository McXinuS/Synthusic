import {Component, OnInit} from '@angular/core';
import {BaseCanvasComponent} from '../base-canvas-component';
import {SoundService} from '@core/services';

@Component({
  selector: 'app-oscilloscope',
  templateUrl: './oscilloscope.component.html',
  styleUrls: ['./oscilloscope.component.css']
})
export class OscilloscopeComponent extends BaseCanvasComponent implements OnInit {

  private _scale: number;
  private _sampleRate: number;
  private renderLivePxPerFreq: number;
  private step: number;
  private _valid: Boolean;

  private lineWidthRes: number;
  private lineWidthSrc: number;
  private lineWidthLive: number;

  get scale(): number {
    return this._scale;
  }

  set scale(sc: number) {
    this._scale = sc;
    this.invalidate();
  }

  get sampleRate(): number {
    return this._sampleRate;
  }

  set sampleRate(sr: number) {
    if (sr < 0) this._sampleRate = 0;
    else if (sr > 100000) this._sampleRate = 100000;
    else this._sampleRate = sr;
    this.invalidate();
  }

  constructor(private soundService: SoundService) {
    super();

    this._valid = true;

    this.lineWidthRes = 2;
    this.lineWidthSrc = 0.7;
    this.lineWidthLive = 1.5;

    this.scale = 0.00004;
    this.sampleRate = 300;
  }

  ngOnInit() {
    this.onResize();
    this.render();

    window.addEventListener('resize', function () {
      this.onResize();
    }.bind(this), true);
  }

  invalidate() {
    this._valid = false;
  }

  render(): void {
    // check for proper state of oscilloscope
    if (this._valid == true || typeof(this.ctx) == 'undefined' || this.width <= 0) {
      window.requestAnimationFrame(() => {
        this.render();
      });
      return;
    }

    this._valid = true;

    this.ctx.beginPath();
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fill();

    this.drawFromBuffer();

    window.requestAnimationFrame(() => {
      this.render()
    });
  }

  onResize() {
    this.renderLivePxPerFreq = this.height / 255.;
    if (this.width > 0) {
      this.step = this.width / this.sampleRate;
    }

    this.invalidate();
  }

  drawFromBuffer() {
    let buffer = this.soundService.getAudioFreqBuffer();
    let scaleX = this.renderLivePxPerFreq;

    this.ctx.lineWidth = this.lineWidthLive;
    this.ctx.strokeStyle = '#000';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    for (let i = 0; i < buffer.length; i++) {
      this.ctx.lineTo(i * this.step, this.height - scaleX * buffer[i]);
    }
    this.ctx.stroke();

    this.invalidate();
  }

}
