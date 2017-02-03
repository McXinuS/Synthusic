import {Injectable} from "@angular/core";
import {Instrument} from "../instrument/instrument.model";

@Injectable()
export class PopupService {
  instrument: Instrument;
  message: string;
  isShown: boolean = false;
  isInstrument: boolean = false;

  show(instrument: Instrument);
  show(message: String);
  show(content: any) {
    if (this.isShown) return;

    if (content instanceof Instrument) {
      this.instrument = content;
      this.isInstrument = true;
    } else if (typeof content == 'string') {
      this.message = content;
    }
    this.isShown = true;
  }

  close() {
    this.isInstrument = false;
    this.isShown = false;
  }
}
