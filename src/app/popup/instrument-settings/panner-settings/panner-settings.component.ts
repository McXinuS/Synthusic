import {Component, OnInit, Input} from '@angular/core';
import {Instrument, Panner} from "../../../shared/instrument/instrument.model";
import {InstrumentService} from "../../../shared/instrument/instrument.service";
import {BaseCanvasComponent, Point} from "../../basecanvas.component";

@Component({
  selector: 'app-panner-settings',
  templateUrl: 'panner-settings.component.html',
  styleUrls: ['panner-settings.component.css']
})
export class PannerSettingsComponent extends BaseCanvasComponent implements OnInit {
  @Input() instrument: Instrument;
  private selectedInstrument: Instrument; // TODO
  private instruments: Instrument[];

  private center: {x: number, y: number};
  private readonly CanvasHeightScale = 0.7;
  private keyboardIcon: HTMLImageElement;
  private keyboardIconSelected: HTMLImageElement;
  private background: CanvasGradient;

  constructor(private instrumentService: InstrumentService) {
    this.instrumentService.instruments$.subscribe(instruments => {
      this.instruments = instruments;
    });
  }

  ngOnInit() {
    this.center = {x: this.width / 2, y: this.height * this.CanvasHeightScale}; // TODO: put into on resize
    this.isMouseDown = false;

    this.background = this.ctx.createRadialGradient(this.center.x, this.center.y, 5,
      this.center.x, this.center.y, this.height);
    this.background.addColorStop(0, "#bbb");
    this.background.addColorStop(1, "#fff");

    this.keyboardIcon = new Image();
    this.keyboardIcon.src = 'img/keyboard_icon.gif';
    this.keyboardIcon.onload = function () {
      this.render();
    }.bind(this);
    this.keyboardIconSelected = new Image();
    this.keyboardIconSelected.src = 'img/keyboard_icon_selected.gif';
    this.keyboardIconSelected.onload = function () {
      this.render();
    }.bind(this);
  }

  render() {
    this.ctx.fillStyle = this.background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (let instrument of this.instruments) {
      let point = this.pannerToCanvasCoordinates(instrument.panner);
      this.ctx.save();
      this.ctx.translate(point.x, point.y);
      if (instrument.id === this.instrument.id) {
        this.ctx.translate(-this.keyboardIcon.width / 2, -this.keyboardIcon.height / 2);
        this.ctx.drawImage(this.keyboardIcon, 0, 0);
      } else {
        this.ctx.translate(-this.keyboardIconSelected.width / 2, -this.keyboardIconSelected.height / 2);
        this.ctx.drawImage(this.keyboardIconSelected, 0, 0);
      }
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
      this.updatePanner();
    }
  }

  onMouseLeave() {
    this.isMouseDown = false;
  }

  private updatePanner() {
    this.instrumentService.updatePanner(this.instrument.id, this.canvasToPannerCoordinates(this.instrument.panner));
    this.render();
  }

  // TODO
  private pannerToCanvasCoordinates(panner: Panner): Point {
    return {
      x: 99,
      y: 99
    }
  }

  private canvasToPannerCoordinates(panner: Panner): Point {
    return {
      x: (panner.x - this.center.x) / this.width * 2,
      y: (this.center.y - panner.y) / this.height
    }
  }
}
