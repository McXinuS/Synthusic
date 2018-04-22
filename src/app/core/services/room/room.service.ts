import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {ChatMessage, Room, User} from '@core/models';
import {WebSocketService} from '../websocket';
import {WebSocketMessageType} from '@shared-global/web-socket-message-types';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class RoomService {

  private _room: Room;
  private roomSource: Subject<Room> = new BehaviorSubject(null);
  room$: Observable<Room> = this.roomSource.asObservable();

  private _users: User[];
  private usersSource: Subject<User[]> = new BehaviorSubject([]);
  users$: Observable<User[]> = this.usersSource.asObservable();

  private _currentUser: User;
  private currentUserSource: Subject<User> = new BehaviorSubject(null);
  currentUser$: Observable<User> = this.currentUserSource.asObservable();

  private readonly MaxMessagesInChat = 100;

  private _messages: ChatMessage[] = [];
  private messagesSource: Subject<ChatMessage[]> = new BehaviorSubject([]);
  messages$: Observable<ChatMessage[]> = this.messagesSource.asObservable();


  constructor(private webSocketService: WebSocketService) {
    this.webSocketService.registerHandler(WebSocketMessageType.room_updated, this.updateRoom.bind(this));
    this.webSocketService.registerHandler(WebSocketMessageType.room_set_max_users, this.onMaxUsersChanged.bind(this));
    this.webSocketService.registerHandler(WebSocketMessageType.chat_new_message, this.insertChatMessage.bind(this));
  }

  init(room: Room, currentUser: User) {
    this.updateRoom(room);
    this.setCurrentUser(currentUser);
  }

  getRooms(): Observable<Room[]> {
    return Observable.fromPromise(this.webSocketService.sendAsync(WebSocketMessageType.get_available_rooms));
  }

  private updateRoom(room: Room) {
    this._room = room;
    this.roomSource.next(room);

    if (this._currentUser) {
      let cu = room.users.find(user => user.id == this._currentUser.id);
      this.setCurrentUser(cu);
    }

    this._users = room.users;
    this.usersSource.next(this._users);
  }

  private setCurrentUser(currentUser: User) {
    this._currentUser = currentUser;
    this.currentUserSource.next(this._currentUser);
  }

  changeRoomName(name: string) {
    this.webSocketService.send(WebSocketMessageType.room_name_update, name);
  }

  changeUserName(name: string) {
    let user = {...this._currentUser, name};
    this.webSocketService.send(WebSocketMessageType.user_update, user);
  }

  getUserById(id: number): User {
    return this._room.users.find(user => user.id == id);
  }

  sendChatMessage(message: string) {
    if (message) {
      this.webSocketService.send(WebSocketMessageType.chat_new_message, message);
    }
  }

  enterRoom(roomId: number) {
    this.webSocketService.send(WebSocketMessageType.enter_room, roomId);
  }

  leaveRoom() {
    this.webSocketService.send(WebSocketMessageType.leave_room);
  }

  private insertChatMessage(message: ChatMessage) {
    if (this._messages.length >= this.MaxMessagesInChat) {
      this._messages.shift();
    }
    this._messages.push(message);
    this.messagesSource.next(this._messages);
  }

  setMaxUsers(maxUsers: number) {
    this.webSocketService.send(WebSocketMessageType.room_set_max_users, maxUsers);
    this.onMaxUsersChanged(maxUsers);
  }

  onMaxUsersChanged(maxUsers: number) {
    this._room.maxUsers = maxUsers;
    this.roomSource.next(this._room);
  }

  setRoomLock(lock: boolean) {
    if (lock === true) {
      this.webSocketService.send(WebSocketMessageType.room_lock);
      this.onRoomLockChanged(lock);
    } else if (lock === false) {
      this.webSocketService.send(WebSocketMessageType.room_unlock);
      this.onRoomLockChanged(lock);
    }
  }

  onRoomLockChanged(lock: boolean) {
    this._room.isLocked = lock;
    this.roomSource.next(this._room);
  }
}
