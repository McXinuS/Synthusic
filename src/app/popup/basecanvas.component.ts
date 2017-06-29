import {ElementRef, ViewChild, Input, AfterViewInit} from "@angular/core";
import {Point} from "../shared/utils/point.model";

export abstract class BaseCanvasComponent implements AfterViewInit{
  @Input() popupScrollTop: number;

  @ViewChild('canvas') canvas: ElementRef;
  ctx: CanvasRenderingContext2D;

  isMouseDown: boolean = false;

  get height() {
    return this.canvas.nativeElement.height;
  }

  get width() {
    return this.canvas.nativeElement.width;
  }

  constructor() {

  }

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.fitCanvasToContainer();
  }

  protected fitCanvasToContainer() {
    let el = this.canvas.nativeElement;
    el.style.width = '100%';
    el.width = el.offsetWidth;
    el.height = el.offsetHeight;
  }

  abstract render(): void;

  protected getMouseCoordinates(event: MouseEvent): Point {
    return {
      x: event.clientX - this.canvas.nativeElement.getBoundingClientRect().left,
      y: event.clientY - this.canvas.nativeElement.getBoundingClientRect().top
    };
  }
}
