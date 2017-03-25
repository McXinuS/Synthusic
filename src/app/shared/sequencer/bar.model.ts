export class Bar {
  index: number;
  width: number;
  noteDistance: number;
  isFirst: boolean = false;
  isLast: boolean = false;

  constructor(index: number, width: number, noteDistance: number) {
    this.index = index;
    this.width = width;
    this.noteDistance = noteDistance;
  }
}
