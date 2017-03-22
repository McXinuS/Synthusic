import {Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit} from '@angular/core';
import {Instrument, Oscillator, OscillatorType} from '../../../shared/instrument/instrument.model';
import {InstrumentService} from '../../../shared/instrument/instrument.service';
import {BaseCanvasComponent, Point} from "../../basecanvas.component";

@Component({
  selector: 'app-oscillator-settings',
  templateUrl: './oscillator-settings.component.html',
  styleUrls: ['./oscillator-settings.component.css']
})

export class OscillatorSettingsComponent extends BaseCanvasComponent {
  @Input() instrument: Instrument;

  readonly freqScaleMax = 10;
  readonly gainScaleMax = 1.1;
  readonly samples = 300;
  OscillatorType = OscillatorType; // make it visible for template

  gainChangeInvert: boolean;
  closestIndex: number = -1;
  selectedIndex: number = -1;
  selectedOscillator: Oscillator;
  oscillatorWaveCache: Map<number, number[]> = new Map();

  private wave(funcName): (number) => number {
    switch (funcName) {
      case 'sine':
        return Math.sin;
      case 'square':
        return function (t) {
          return t === 0 ? 0 : (Math.sin(t) > 0) ? 1 : -1;
        };
      case 'sawtooth':
        return function (t) {
          if (t > 0) return 2 * ((t / 2 / Math.PI) % 1) - 1;
          else return 2 * ((t / 2 / Math.PI) % 1) + 1;
        };
      case 'triangle':
        return function (t) {
          if (t > 0) return 4 * Math.abs((t / 2 / Math.PI) % 1 - 0.5) - 1;
          else return 4 * Math.abs((t / 2 / Math.PI) % 1 + 0.5) - 1;
        };
      default:
        return Math.sin;
    }
  };

  constructor(private instrumentService: InstrumentService) {
    super();
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.render();
  }

  render() {
    this.checkCache();

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = 'rgba(0,0,0,.02)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.drawGrid(this.width, this.height);
    this.drawOscillators(this.width, this.height);
  }

  drawOscillators(w: number, h: number) {
    const step = w / this.samples;
    let height, i, j, waveCache;

    for (i = 0; i < this.instrument.oscillators.length; i++) {
      let osc = this.instrument.oscillators[i];
      waveCache = this.oscillatorWaveCache.get(this.getOscillatorHash(osc));
      height = -h / 2 / this.gainScaleMax;
      if (this.selectedIndex === i) this.ctx.lineWidth = 3;
      else if (this.closestIndex === i) this.ctx.lineWidth = 2;
      else this.ctx.lineWidth = 1;

      this.ctx.beginPath();
      this.ctx.strokeStyle = this.getWaveColor(osc.freq, osc.gain);
      this.ctx.moveTo(0, height * waveCache[0] + h / 2);
      for (j = 1; j < this.samples; j++) {
        this.ctx.lineTo(j * step, height * waveCache[j] + h / 2);
      }
      this.ctx.stroke();
    }

    this.ctx.lineWidth = 1;
  }

  drawGrid(w: number, h: number) {
    this.ctx.lineWidth = 0.1;
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#888';
    this.ctx.moveTo(0, h / 2);
    this.ctx.lineTo(w, h / 2);
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, h);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.lineWidth = 0.5;
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = '#888';
    const markLength = 10, numberMargin = 5;
    let x;
    for (let i = 0.5; i <= 8; i *= 2) {
      x = (w / this.freqScaleMax) * i;
      this.ctx.fillText(i.toString(), x + numberMargin, h / 2 - numberMargin);
      this.ctx.moveTo(x, h / 2 - markLength / 2);
      this.ctx.lineTo(x, h / 2 + markLength / 2);
    }
    this.ctx.stroke();
    this.ctx.fillText('1', numberMargin, (h / 2) * (1 - 1 / this.gainScaleMax) + numberMargin);
    this.ctx.fillText('-1', numberMargin, (h / 2) * (1 + 1 / this.gainScaleMax) + numberMargin);
  }

  checkCache() {
    let hash, hashes = [];
    for (let osc of this.instrument.oscillators) {
      hash = this.getOscillatorHash(osc);
      hashes.push(hash);
      if (!this.oscillatorWaveCache.has(hash)) {
        let waveValues = [],
          freq = Math.PI * this.freqScaleMax / osc.freq / this.samples,
          waveFunc = this.wave(osc.type);
        for (let i = 0; i < this.samples; i++) {
          waveValues.push(osc.gain * waveFunc(freq * i));
        }
        this.oscillatorWaveCache.set(hash, waveValues);
      }
    }

    this.oscillatorWaveCache.forEach((val: number[], hashKey: number) => {
      if (hashes.indexOf(hashKey) == -1) {
        this.oscillatorWaveCache.delete(hashKey);
      }
    });
  }

  onMouseDown(e: MouseEvent) {
    this.gainChangeInvert = this.getMouseCoordinates(e).y <= this.height / 2;
    if (e.which == 1) {
      this.isMouseDown = true;
      this.selectedIndex = this.closestIndex;
      this.selectedOscillator = this.instrument.oscillators[this.selectedIndex];
      this.render();
    } else if (e.which == 3) {
      if (this.closestIndex != -1) {
        this.instrumentService.deleteOscillator(this.instrument.id, this.instrument.oscillators[this.closestIndex]);
        this.closestIndex = -1;
      } else {
        this.isMouseDown = true;
        let osc = new Oscillator();
        osc.freq = 1;
        osc.gain = 1;
        osc.type = 'sine';
        this.instrumentService.addOscillator(this.instrument.id, osc);
      }
      this.render();
    }
  }

  onMouseMove(e: MouseEvent) {
    let point = this.getMouseCoordinates(e),
      oscillators = this.instrument.oscillators;

    if (!this.isMouseDown) {
      this.closestIndex = this.findClosesOscillator(point);
      if (this.selectedIndex == -1) this.selectedOscillator = oscillators[this.closestIndex];
    } else if (this.closestIndex != -1) {
      let gainChange = e.movementY / this.height * 2 * this.gainScaleMax,
        freqChange = e.movementX / this.width * this.freqScaleMax;
      if (this.gainChangeInvert) gainChange = -gainChange;

      let newGain = (oscillators[this.closestIndex].gain) + gainChange,
        newFreq = (oscillators[this.closestIndex].freq) * (1 + freqChange);
      if (newGain < 0) {
        this.gainChangeInvert = !this.gainChangeInvert;
        newGain = -newGain;
      }
      if (newGain > 1) newGain = 1;
      if (newFreq <= 0.25) newFreq = 0.25;
      if (newFreq > 8) newFreq = 8;

      oscillators[this.closestIndex].gain = newGain;
      oscillators[this.closestIndex].freq = newFreq;
    }

    this.render();
  }

  onMouseUp() {
    if (this.isMouseDown) {
      this.isMouseDown = false;
      this.removeDuplicates();
    }
  }

  onDoubleClick(e) {
    if (e.which == 1 && this.selectedIndex != -1) {
      let newTypeIndex = (OscillatorType.indexOf(this.selectedOscillator.type) + 1) % OscillatorType.length;
      this.updateProperty('type', OscillatorType[newTypeIndex], true);
      this.render();
    }
  }

  onMouseLeave() {
    this.onMouseUp();
    this.render();
  }

  updateProperty(type: string,
                 value: number | string,
                 broadcast: boolean = false,
                 oscillator: Oscillator = this.selectedOscillator) {
    if (type != 'type' && typeof value == 'string') value = parseFloat(value);
    this.instrumentService.updateOscillator(this.instrument.id, oscillator, type, value);
    this.render();
  }

  findClosesOscillator(point: Point): number {
    let closestInd = -1, distanceMin = 50, distanceCur;
    for (let i = 0; i < this.instrument.oscillators.length; i++) {
      distanceCur = Math.abs(
        this.getOscillatorY(this.instrument.oscillators[i], point.x, this.width, this.height)
        - point.y
      );
      if (distanceMin > distanceCur) {
        distanceMin = distanceCur;
        closestInd = i;
      }
    }
    return closestInd;
  }

  getOscillatorY(osc: Oscillator, x: number, w: number, h: number): number {
    let height = -h / 2 / this.gainScaleMax,
      sampleNum = Math.floor(this.samples * x / w),
      waveCache = this.oscillatorWaveCache.get(this.getOscillatorHash(osc));
    return height * waveCache[sampleNum] + h / 2;
  }

  getOscillatorHash(oscillator: Oscillator) {
    let type = OscillatorType.indexOf(oscillator.type);
    return type * 10000 + Math.round(oscillator.freq * 1000) + oscillator.gain;
  }

  /**
   * Color is based on the note's frequency scale and gain.
   * The less a value of gain, the less saturation is in result.
   */
  getWaveColor(scale: number, gain: number) {
    let relIndex = scale > 8 ? 1 : scale / 8;
    let sat = Math.round(100 * gain);
    if (sat > 100) sat = 100;
    if (sat < 30) sat = 30;
    return `hsl(${180 + 120 * relIndex},${sat}%,50%)`;
  }

  removeDuplicates() {
    let oscillators = this.instrument.oscillators,
      hashes = [],
      removed = [],
      i, j;

    for (i = 0; i < oscillators.length; i++) {
      hashes.push(this.getOscillatorHash(oscillators[i]));
    }

    for (i = 0; i < hashes.length; i++) {
      for (j = i + 1; j < hashes.length; j++) {
        if (hashes[i] == hashes[j]) {
          removed.push(oscillators[i]);
          break;
        }
      }
    }

    for (let osc of removed) {
      this.instrumentService.deleteOscillator(this.instrument.id, osc);
    }
  }
}
