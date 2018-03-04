export class Rectangle {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  width: number;
  height: number;

  constructor(x0: number, y0: number, w: number, h: number) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x0 + w;
    this.y1 = y0 + h;
    this.width = w;
    this.height = h;
  }
}
