import {Instrument} from '@shared-global/models';

export class PopupData {
  id: number;
  type: PopupType;
  payload: any;
  isModal: boolean = false; // popup can be dismissed
  isText: boolean = false;  // popup has only text/images; doesn't contain complex objects

  constructor(id: number, type: PopupType) {
    this.id = id;
    this.type = type;
  }
}

export enum PopupType {
  text = 1,
  error,
  loading,
  instrument, // instrument settings popup
}

export class TextPopupData extends PopupData {
  constructor(id: number, header: string, message: string) {
    super(id, PopupType.text);
    this.isText = true;
    this.payload = { header, message };
  }
}

export class ErrorPopupData extends TextPopupData {
  type = PopupType.error;
}

export class LoadingPopupData extends TextPopupData {
  type = PopupType.loading;
  isModal = true;
}

export class InstrumentPopupData extends PopupData {
  type = PopupType.instrument;

  constructor(id: number, instrument: Instrument) {
    super(id, PopupType.instrument);
    this.payload = { instrument };
  }
}
