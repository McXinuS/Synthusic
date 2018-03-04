import {Component, OnInit, Input} from '@angular/core';
import {Instrument, PannerConfig, Point, Rectangle} from "@core/models";
import {InstrumentService} from "@core/services";
import {BaseCanvasComponent} from "../base-canvas-component";

@Component({
  selector: 'app-panner-settings',
  templateUrl: './panner-settings.component.html',
  styleUrls: ['./panner-settings.component.css']
})
export class PannerSettingsComponent extends BaseCanvasComponent implements OnInit {
  @Input() instrument: Instrument;
  private selectedInstrument: Instrument;
  private instruments: Instrument[];
  private instrumentBoxes: Map<number, Rectangle> = new Map();

  private center: { x: number, y: number };
  private readonly CanvasHeightScale = 0.7;

  private keyboardIcon: HTMLImageElement;
  private keyboardIconSelected: HTMLImageElement;
  private readonly IconsToLoad = 2;
  private iconsLoaded = 0;

  private background: CanvasGradient;
  private readonly CanvasGradientColorMin = '#bbb';
  private readonly CanvasGradientColorMax = '#fff';
  private readonly CanvasTextColorDefault = '#000';
  private readonly CanvasTextColorSelected = '#585';

  constructor(private instrumentService: InstrumentService) {
    super();
    this.instrumentService.instruments$.subscribe(instruments => {
      this.instruments = instruments;
      this.render();
    });
  }

  ngOnInit() {
    this.isMouseDown = false;

    this.selectedInstrument = this.instrument;

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
    if (!this.instrument || !this.instruments) return;

    this.recalculateInstrumentBoxes();

    this.ctx.fillStyle = this.background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    let box, icon, isMainInstrument;
    for (let instrument of this.instruments) {
      isMainInstrument = instrument.id === this.instrument.id;
      box = this.instrumentBoxes.get(instrument.id);
      icon = isMainInstrument ? this.keyboardIconSelected : this.keyboardIcon;
      this.ctx.save();
      this.ctx.translate(box.x0, box.y0);
      this.ctx.drawImage(icon, 0, 0);
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = isMainInstrument
        ? this.CanvasTextColorSelected
        : this.CanvasTextColorDefault;
      this.ctx.fillText(instrument.name, box.width / 2, box.height + 14);
      this.ctx.restore();
      this.ctx.fill();
    }
  }

  onMouseDown(e) {
    this.isMouseDown = true;
    this.selectInstrument(this.getMouseCoordinates(e));
    this.onMouseMove(e);
  }

  onMouseMove(e) {
    if (this.isMouseDown) {
      this.updatePanner(this.canvasToPannerCoordinates(this.getMouseCoordinates(e)));
    }
  }

  onMouseUp() {
    this.isMouseDown = false;
  }

  onMouseLeave() {
    this.isMouseDown = false;
  }

  private recalculateInstrumentBoxes() {
    this.instrumentBoxes.clear();
    let icon, point;
    for (let instrument of this.instruments) {
      icon = instrument.id === this.instrument.id
        ? this.keyboardIconSelected : this.keyboardIcon;
      point = this.pannerToCanvasCoordinates(instrument.panner);
      this.instrumentBoxes.set(instrument.id, new Rectangle(
        point.x - icon.width / 2, point.y - icon.height / 2,
        icon.width, icon.height
      ));
    }
  }

  private selectInstrument(coord: Point) {
    let currentBox;
    // iterate with respect of to z-index
    for (let i = this.instruments.length - 1; i >= 0; i--) {
      currentBox = this.instrumentBoxes.get(this.instruments[i].id);
      if ((currentBox.x0 <= coord.x && coord.x <= currentBox.x1) &&
        (currentBox.y0 <= coord.y && coord.y <= currentBox.y1)) {
        this.selectedInstrument = this.instruments[i];
        return;
      }
    }
    this.selectedInstrument = this.instrument;
  }

  private updatePanner(panner: PannerConfig) {
    this.instrumentService.updatePanner(this.selectedInstrument.id, panner);
    this.render();
  }

  private pannerToCanvasCoordinates(panner: PannerConfig): Point {
    return {
      x: panner.x * this.width / 2 + this.center.x,
      y: this.center.y * (1 - panner.y)
    }
  }

  private canvasToPannerCoordinates(coord: Point): PannerConfig {
    return {
      x: (coord.x - this.center.x) / this.width * 2,
      y: 1 - coord.y / this.center.y
    }
  }

  private onIconLoaded() {
    this.iconsLoaded++;
    if (this.iconsLoaded >= this.IconsToLoad) {
      this.render();
    }
  }
}
