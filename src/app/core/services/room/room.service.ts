import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {ChatMessage, Room, User} from '@core/models';
import {WebSocketService} from '../websocket';
import {WebSocketMessageType} from '@shared-global/web-socket-message-types';

@Injectable()
export class RoomService {
  private _room: Room;
  private roomSource: Subject<Room> = new Subject();
  room$: Observable<Room>;

  currentUser: User;

  private readonly MaxMessagesInChat = 100;
  private _messages: ChatMessage[] = [];
  private messagesSource: Subject<ChatMessage[]> = new Subject();
  messages$: Observable<ChatMessage[]>;

  constructor(private webSocketService: WebSocketService) {
    this.room$ = this.roomSource.asObservable();
    this.webSocketService.registerHandler(WebSocketMessageType.room_updated, this.updateRoom.bind(this));

    this.messages$ = this.messagesSource.asObservable();
    this.webSocketService.registerHandler(WebSocketMessageType.chat_new_message, this.insertChatMessage.bind(this));
  }

  init(room: Room, currentUser: User) {
    this.currentUser = currentUser;
    this.updateRoom(room);
  }

  private updateRoom(room: Room) {
    if (this.currentUser) {
      this.currentUser = room.users.find(user => user.id == this.currentUser.id);
    }
    this._room = room;
    this.roomSource.next(room);
  }

  changeRoomName(name: string) {
    this.webSocketService.send(WebSocketMessageType.room_name_update, name);
  }

  changeUserName(name: string) {
    this.currentUser.name = name;
    this.webSocketService.send(WebSocketMessageType.user_update, this.currentUser);
  }

  getUserById(id: number): User {
    return this._room.users.find(user => user.id == id);
  }

  sendChatMessage(message: string) {
    if (message) {
      this.webSocketService.send(WebSocketMessageType.chat_new_message, message);
    }
  }

  private insertChatMessage(message: ChatMessage) {
    if (this._messages.length >= this.MaxMessagesInChat) {
      this._messages.shift();
    }
    this._messages.push(message);
    this.messagesSource.next(this._messages);
  }
}
