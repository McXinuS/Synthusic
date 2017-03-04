import {WebSocketMessageType} from "../../../../shared/web-socket-message-types";
import {BroadcasterService} from "../broadcaster/broadcaster.service";
import {WebSocketMessage} from "./websocketmessage.model";
import {BroadcastTopic} from "../broadcaster/broadcasttopic.enum";

export class WebSocketCustomMessageHandler {
  type: WebSocketMessageType;
  callback: (data: any) => any;
  constructor(type: WebSocketMessageType, callback: (data: any) => any){
    this.type = type;
    this.callback = callback;
  }
}

export class WebSocketMessageHandler {
  internalHandlers: Map<WebSocketMessageType, (data: any) => any> = new Map();
  oneTimeHandlers: Array<WebSocketCustomMessageHandler> = [];

  constructor(private broadcaster: BroadcasterService) {
    this.internalHandlers.set(WebSocketMessageType.note_add, this.onNoteAdd);
    this.internalHandlers.set(WebSocketMessageType.note_remove, this.onNoteRemove);
    this.internalHandlers.set(WebSocketMessageType.instrument_add, this.onInstrumentAdd);
    this.internalHandlers.set(WebSocketMessageType.instrument_update, this.onInstrumentUpdate);
    this.internalHandlers.set(WebSocketMessageType.instrument_delete, this.onInstrumentDelete);
    this.internalHandlers.set(WebSocketMessageType.room_users_update, this.onRoomUsersUpdate);
    this.internalHandlers.set(WebSocketMessageType.room_name_update, this.onRoomNameUpdate);
    this.internalHandlers.set(WebSocketMessageType.chat_new_message, this.onChatMessage);
    //this.internalHandlers.set(WebSocketMessageType.get_state, this.);
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
    this.broadcaster.broadcast(BroadcastTopic.addNote, data);
  }

  private onNoteRemove(data) {
    this.broadcaster.broadcast(BroadcastTopic.removeNote, data);
  }

  private onInstrumentAdd(data) {

  }

  private onInstrumentUpdate(data) {

  }

  private onInstrumentDelete(data) {

  }

  // TODO update model in room service instead on broadcast
  private onRoomUsersUpdate(data) {

  }

  private onRoomNameUpdate(data) {

  }

  private onChatMessage(data) {
    this.broadcaster.broadcast(BroadcastTopic.chatMessage, data);
  }

  registerOnce(handler: WebSocketCustomMessageHandler) {
    this.oneTimeHandlers.push(handler);
  }
}
