import {Injectable} from "@angular/core";
import {Instrument} from "../instrument/instrument.model";

@Injectable()
export class PopupService {
  instrument: Instrument;
  header: string;
  message: string;

  isShown: boolean = false;
  isInstrument: boolean = false;

  // closeTimeoutId: number;
  // isClosing: boolean = false;
  // readonly CloseTimeout: number = 300;

  show(instrument: Instrument);
  show(header:string, message: String);
  show(content: any, content2?: string) {
    if (this.isShown) return;

    // if (this.isClosing) this.close(false);

    if (typeof content == 'object') {
      this.instrument = content;
      this.isInstrument = true;
    } else if (typeof content == 'string') {
      this.header = content;
      this.message = content2;
    }
    this.isShown = true;
  }

  close() { // delay = true) {
    // if (delay) {
    //   this.isClosing = true;
    //   this.closeTimeoutId = setTimeout(this.close.bind(this, false), this.CloseTimeout);
    // } else {
    //   clearInterval(this.closeTimeoutId);
    //   this.isClosing = false;
    //   this.isInstrument = false;
    //   this.isShown = false;
    // }

    this.isInstrument = false;
    this.isShown = false;
  }
}
