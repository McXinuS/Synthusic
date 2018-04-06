import {Injectable} from '@angular/core';
import {ErrorPopupData, InstrumentPopupData, LoadingPopupData, PopupData, PopupType, TextPopupData} from '@core/models';
import {Instrument, Room} from '@shared-global/models';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {RoomListPopupData} from '@core/models/popup-data.model';

// TODO animations

@Injectable()
export class PopupService {

  isShown: boolean = false;

  private lastPopupId = 0;

  // Array of popup messages. New messages will always be pushed on top.
  private popupData: PopupData[] = [];
  private popupDataSource: Subject<PopupData[]> = new Subject<PopupData[]>();
  popupData$: Observable<PopupData[]> = this.popupDataSource.asObservable();

  private show(data: PopupData): number {
    this.isShown = true;

    this.popupData.push(data);
    this.popupDataSource.next(this.popupData);

    return data.id;
  }

  private getNextId(): number {
    this.lastPopupId++;
    return this.lastPopupId;
  }

  /**
   * Creates object of popup window data.
   */
  private createPopupData(type: PopupType, ...payload: any[]): PopupData {
    let id = this.getNextId();
    return this.createPopupDataWithId(id, type, ...payload);
  }

  /**
   * Creates object of popup window data with given ID.
   */
  private createPopupDataWithId(id: number, type: PopupType, ...payload: any[]): PopupData {
    switch (type) {
      case PopupType.text:
        return new TextPopupData(id, payload[0], payload[1]);
      case PopupType.error:
        return new ErrorPopupData(id, payload[0], payload[1]);
      case PopupType.loading:
        return new LoadingPopupData(id, payload[0], payload[1]);
      case PopupType.instrument:
        return new InstrumentPopupData(id, payload[0]);
      case PopupType.room_list:
        return new RoomListPopupData(id, payload[0], payload[1]);
      default:
        throw new Error('Incorrect popup data type.');
    }
  }

  showMessage(header: string, message: string): number {
    let data = this.createPopupData(PopupType.text, header, message);
    return this.show(data);
  }

  showError(header: string, message: string): number {
    let data = this.createPopupData(PopupType.error, header, message);
    return this.show(data);
  }

  showLoader(header: string, message: string): number {
    let data = this.createPopupData(PopupType.loading, header, message);
    return this.show(data);
  }

  showInstrument(instrument: Instrument): number {
    let data = this.createPopupData(PopupType.instrument, instrument);
    return this.show(data);
  }

  showRoomList(rooms: Room[], onSelected: () => any): number {
    let data = this.createPopupData(PopupType.room_list, rooms, onSelected);
    return this.show(data);
  }

  private getPopupIndex(id: number): number {
    return this.popupData.findIndex(data => data.id === id);
  }

  /**
   * Replaces content of popup window with given ID with new payload.
   * @param {number} id ID of the popup.
   * @param {any[]} payload New popup content.
   */
  update(id: number, ...payload: any[]) {

    let index = this.getPopupIndex(id);

    if (index === -1) {
      return;
    }

    let data = this.popupData[index];
    let type = data.type;
    // Update object reference object get rid of possible change detection problems
    data = this.createPopupDataWithId(id, type, ...payload);

    this.popupData[index] = data;
    this.popupDataSource.next(this.popupData);
  }

  /**
   * Close popup window by ID.
   */
  close(id: number) {

    let index = this.getPopupIndex(id);
    if (index > -1) {
      this.popupData.splice(index, 1);
    }

    this.isShown = this.popupData.length !== 0;
    this.popupDataSource.next(this.popupData);
  }

  /**
   * Close all the popups.
   */
  closeAll() {
    this.popupData = [];

    this.isShown = this.popupData.length !== 0;
    this.popupDataSource.next(this.popupData);
  }

  onDismiss() {
    let lastPopup = this.popupData[this.popupData.length - 1];
    if (!lastPopup.isModal) {
      this.close(lastPopup.id);
    }
  }
}
