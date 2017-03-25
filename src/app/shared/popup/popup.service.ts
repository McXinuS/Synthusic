import {Injectable} from "@angular/core";
import {Instrument} from "../instrument/instrument.model";
import {BehaviorSubject, Observable, Subject} from "rxjs";

@Injectable()
export class PopupService {
  instrument: Instrument;
  header: string;
  message: string;

  isShown: boolean = false;
  isInstrument: boolean = false;

  closeTimeoutId: number;
  isClosing: boolean = false;
  readonly CloseTimeout: number = 300;

  private show() {
    if (this.isClosing) this.close(false);
    this.isShown = true;
  }

  showMessage(header: string, message: string) {
    this.header = header;
    this.message = message;
    this.isInstrument = false;
    this.show();
  }

  showInstrument(instrument: Instrument) {
    this.updateInstrument(instrument);
    this.isInstrument = true;
    this.show();
  }

  updateInstrument(instrument: Instrument) {
    this.instrument = instrument;
  }

  close(delay = true) {
    this.isShown = false;
    if (delay) {
      this.isClosing = true;
      this.closeTimeoutId = setTimeout(this.close.bind(this, false), this.CloseTimeout);
    } else {
      clearInterval(this.closeTimeoutId);
      this.isClosing = false;
    }
  }
}
