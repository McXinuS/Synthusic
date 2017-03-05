import {WebSocketMessageType} from "../../../../shared/web-socket-message-types";
import {WebSocketMessage} from "./websocketmessage.model";
import {SequencerNote} from "../sequencer/sequencernote.model";
import {Instrument} from "../instrument/instrument.model";
import {Injectable} from "@angular/core";
import {InstrumentService} from "../instrument/instrument.service";
import {SequencerService} from "../sequencer/sequencer.service";
import {RoomService} from "../room/room.service";
import {ChatMessage} from "../room/chat.model";

export class WebSocketCustomMessageHandler {
  type: WebSocketMessageType;
  callback: (data: any) => any;
  constructor(type: WebSocketMessageType, callback: (data: any) => any){
    this.type = type;
    this.callback = callback;
  }
}

@Injectable()
export class WebSocketHandlerService {
  internalHandlers: Map<WebSocketMessageType, (data: any) => any> = new Map();
  oneTimeHandlers: Array<WebSocketCustomMessageHandler> = [];

  constructor(private instrumentService: InstrumentService,
              private sequencerService: SequencerService,
              private roomService: RoomService) {
    this.internalHandlers.set(WebSocketMessageType.note_add, this.onNoteAdd);
    this.internalHandlers.set(WebSocketMessageType.note_remove, this.onNoteRemove);
    this.internalHandlers.set(WebSocketMessageType.instrument_add, this.onInstrumentAdd);
    this.internalHandlers.set(WebSocketMessageType.instrument_update, this.onInstrumentUpdate);
    this.internalHandlers.set(WebSocketMessageType.instrument_delete, this.onInstrumentDelete);
    this.internalHandlers.set(WebSocketMessageType.room_update, this.onRoomUpdate);
    this.internalHandlers.set(WebSocketMessageType.chat_new_message, this.onChatMessage);
  }

  onMessage(message: WebSocketMessage) {
    let intHandler = this.internalHandlers.get(message.type);
    if (intHandler) intHandler(message.data);

    for (let i = this.oneTimeHandlers.length - 1; i >= 0; i--) {
      if (this.oneTimeHandlers[i].type === message.type) {
        this.oneTimeHandlers[i].callback(message.data);
        this.oneTimeHandlers.splice(i, 1);
      }
    }
  }

  // TODO assert 'data' values !!!

  private onNoteAdd(data) {
    if (!(data instanceof SequencerNote)) return;
  }

  private onNoteRemove(data) {
    if (!(data instanceof SequencerNote)) return;
  }

  private onInstrumentAdd(data) {
    if (data instanceof Instrument) {

    }
  }

  private onInstrumentUpdate(data) {
    if (data instanceof Instrument) {

    }
  }

  private onInstrumentDelete(data) {
    if (typeof data == 'number') {
      this.instrumentService.deleteInstrument(data);
    }
  }

  private onRoomUpdate(data) {

  }

  private onChatMessage(data) {
    if (data instanceof ChatMessage) {
      this.roomService.addMessage(data);
    }
  }

  registerOnce(handler: WebSocketCustomMessageHandler) {
    this.oneTimeHandlers.push(handler);
  }
}
