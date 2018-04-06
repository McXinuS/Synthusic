import {Instrument, Room} from '@shared-global/models';

export class PopupData {

  /**
   * Internal ID of the popup.
   */
  id: number;

  type: PopupType;

  payload: any;

  /**
   * Shows if the popup can be dismissed.
   */
  isModal: boolean = false;

  /**
   * Shows if the popup has only text/images, doesn't contain complex objects
   */
  isText: boolean = false;

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
  room_list,
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
  constructor(id: number, instrument: Instrument) {
    super(id, PopupType.instrument);
    this.payload = { instrument };
  }
}

export class RoomListPopupData extends PopupData {
  constructor(id: number, rooms: Room[], roomChangeHandler: any) {
    super(id, PopupType.room_list);
    this.payload = { rooms, roomChangeHandler };
  }
}
