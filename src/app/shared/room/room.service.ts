import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {ChatMessage} from './chat.model';
import {WebSocketService} from '../websocket/websocket.service';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';
import {Room} from "./room.model";

@Injectable()
export class RoomService {
  private roomSource: Subject<Room> = new Subject();
  room$: Observable<Room>;

  private _messages: ChatMessage[] = [];
  private messagesSource: Subject<ChatMessage[]> = new Subject();
  messages$: Observable<ChatMessage[]>;

  private readonly MaxMessagesInChat = 100;

  constructor(private webSocketService: WebSocketService) {
    this.room$ = this.roomSource.asObservable();
    this.webSocketService.registerHandler(WebSocketMessageType.room_updated, this.updateRoom.bind(this));

    this.messages$ = this.messagesSource.asObservable();
    this.webSocketService.registerHandler(WebSocketMessageType.chat_new_message, this.addChatMessage.bind(this));
  }

  init(room: Room) {
    this.updateRoom(room);
  }

  private updateRoom(room: Room) {
    this.roomSource.next(room);
  }

  changeRoomName(name: string) {
    this.webSocketService.send(WebSocketMessageType.room_name_update, name);
  }

  private addChatMessage(message: ChatMessage) {
    if (this._messages.length >= this.MaxMessagesInChat) {
      this._messages.shift();
    }
    this._messages.push(message);
    this.messagesSource.next(this._messages);
  }

  sendChatMessage(message: string) {
    if (message) {
      this.webSocketService.send(WebSocketMessageType.chat_new_message, message);
      this.addChatMessage(new ChatMessage('me', message));
    }
  }
}
