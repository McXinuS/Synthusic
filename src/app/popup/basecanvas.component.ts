import {ElementRef, ViewChild, Input} from "@angular/core";

export class Point {
  x: number;
  y: number;
}

export abstract class BaseCanvasComponent {
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

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.fitCanvasToContainer();
    this.render();
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
      x: event.clientX - this.canvas.nativeElement.offsetLeft,
      y: event.clientY + this.popupScrollTop - this.canvas.nativeElement.offsetTop
    };
  }
}
