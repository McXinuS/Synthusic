import {Injectable} from "@angular/core";
import {Instrument} from "../instrument/instrument.model";

export interface PopupMessage {

}

@Injectable()
export class PopupService {
  instrument: Instrument;
  header: string;
  message: string;

  isShown: boolean = false;
  isInstrument: boolean = false;

  show(instrument: Instrument);
  show(header:string, message: String);
  show(content: any, content2?: string) {
    if (this.isShown) return;

    if (typeof content == 'object') {
      this.instrument = content;
      this.isInstrument = true;
    } else if (typeof content == 'string') {
      this.header = content;
      this.message = content2;
    }
    this.isShown = true;
  }

  close() {
    this.isInstrument = false;
    this.isShown = false;
  }
}
