import {Component, OnInit, Input} from '@angular/core';
import {Instrument, PannerConfig} from "../../../shared/instrument/instrument.model";
import {InstrumentService} from "../../../shared/instrument/instrument.service";
import {BaseCanvasComponent, Point} from "../../basecanvas.component";

@Component({
  selector: 'app-panner-settings',
  templateUrl: './panner-settings.component.html',
  styleUrls: ['./panner-settings.component.css']
})
export class PannerSettingsComponent extends BaseCanvasComponent implements OnInit {
  @Input() instrument: Instrument;
  private selectedInstrument: Instrument; // TODO
  private instruments: Instrument[];

  private center: {x: number, y: number};
  private readonly CanvasHeightScale = 0.7;

  private keyboardIcon: HTMLImageElement;
  private keyboardIconSelected: HTMLImageElement;
  private readonly CanvasGradientColorMin = '#bbb';
  private readonly CanvasGradientColorMax = '#fff';
  private background: CanvasGradient;

  private readonly IconsToLoad = 2;
  private iconsLoaded = 0;

  private readonly CanvasTextColorDefault = '#000';
  private readonly CanvasTextColorSelected = '#6a6';

  constructor(private instrumentService: InstrumentService) {
    super();
    this.instrumentService.instruments$.subscribe(instruments => {
      this.instruments = instruments;
    });
  }

  ngOnInit() {
    this.isMouseDown = false;

    this.keyboardIcon = new Image();
    this.keyboardIcon.src = 'img/keyboard_icon.gif';
    this.keyboardIconSelected = new Image();
    this.keyboardIconSelected.src = 'img/keyboard_icon_green.gif';
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();

    this.center = {x: this.width / 2, y: this.height * this.CanvasHeightScale}; // TODO: put into on resize

    this.ctx.font = "12px Arial";
    this.background = this.ctx.createRadialGradient(this.center.x, this.center.y, 5,
      this.center.x, this.center.y, this.height);
    this.background.addColorStop(0, this.CanvasGradientColorMin);
    this.background.addColorStop(1, this.CanvasGradientColorMax);

    this.keyboardIcon.onload = this.onIconLoaded.bind(this);
    this.keyboardIconSelected.onload = this.onIconLoaded.bind(this);

    this.render();
  }

  render() {
    if (!this.instruments) return;

    this.ctx.fillStyle = this.background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    let point, icon, isMainInstrument;
    for (let instrument of this.instruments) {
      isMainInstrument = instrument.id === this.instrument.id;
      this.ctx.save();
      point = this.pannerToCanvasCoordinates(instrument.panner);
      this.ctx.translate(point.x, point.y);
      icon = isMainInstrument ? this.keyboardIconSelected : this.keyboardIcon;
      this.ctx.translate(-icon.width / 2, -icon.height / 2);
      this.ctx.drawImage(icon, 0, 0);
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = isMainInstrument
        ? this.CanvasTextColorSelected
        : this.CanvasTextColorDefault;
      this.ctx.fillText(instrument.name, icon.width / 2, icon.height + 14);
      this.ctx.restore();
      this.ctx.fill();
    }
  }

  onMouseDown(e) {
    this.isMouseDown = true;
    this.onMouseMove(e);
  }

  onMouseUp(e) {
    this.isMouseDown = false;
  }

  onMouseMove(e) {
    if (this.isMouseDown) {
      this.updatePanner(this.canvasToPannerCoordinates(this.getMouseCoordinates(e)));
    }
  }

  onMouseLeave() {
    this.isMouseDown = false;
  }

  private updatePanner(panner: PannerConfig) {
    this.instrumentService.updatePanner(this.instrument.id, panner);
    this.render();
  }

  private pannerToCanvasCoordinates(panner: PannerConfig): Point {
    return {
      x: panner.x * this.width / 2 + this.center.x,
      y: panner.y * this.center.y
    }
  }

  private canvasToPannerCoordinates(point: Point): PannerConfig {
    return {
      x: (point.x - this.center.x) / this.width * 2,
      y: point.y / this.center.y
    }
  }

  private onIconLoaded() {
    this.iconsLoaded++;
    if (this.iconsLoaded >= this.IconsToLoad) {
      this.render();
    }
  }
}
