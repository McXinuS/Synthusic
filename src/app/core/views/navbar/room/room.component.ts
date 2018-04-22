import {Component, OnInit, ElementRef, ViewChild, AfterViewChecked, Output, EventEmitter} from '@angular/core';
import {RoomService} from '@core/services';
import {ChatMessage, Room} from '@core/models';
import {Observable} from 'rxjs';
import {User} from '@shared-global/models';

// TODO split into room-chat and room-users

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css', '../navbar.theme.css']
})
export class RoomComponent implements OnInit, AfterViewChecked {

  rooms$: Observable<Room[]>;
  isRoomsLoading: boolean = true;

  roomUsers$: Observable<User[]>;

  room$: Observable<Room>;
  room: Room;
  roomName: string;
  roomNameChanged: boolean = false;

  currentUser: User;
  userName: string;
  userNameChanged: boolean = false;

  chatMessages: ChatMessage[];
  isChatEmpty: boolean = true;
  @ViewChild('messages') private chatContainer: ElementRef;
  chatStickToBottom: boolean = true;
  myMessage: string;

  constructor(private roomService: RoomService) {
  }

  ngOnInit() {
    this.roomService.room$.subscribe(room => {
      this.room = room;
      this.roomName = room.name;
      this.roomNameChanged = false;
    });

    this.roomService.currentUser$.subscribe(cu => {
      this.currentUser = cu;
      if (!this.userNameChanged) {
        this.userName = this.currentUser && this.currentUser.name;
      }
    });

    this.roomService.messages$.subscribe(messages => {
      this.onMessagesUpdated(messages);
    });

    this.room$ = this.roomService.room$;

    this.rooms$ = this.roomService.getRooms();
    this.rooms$.subscribe(null, null, () => this.isRoomsLoading = false);

    this.roomUsers$ = this.roomService.users$;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  onMessagesUpdated(messages: ChatMessage[]) {
    this.chatMessages = messages.map(msg => new ChatMessage(
      this.roomService.getUserById(msg.sender as number).name,
      msg.message
    ));

    this.isChatEmpty = messages.length === 0;
  }

  scrollToBottom(): void {
    if (this.chatStickToBottom) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  // Scroll chat window when new messages are received
  // if the window is scrolled down to the end.
  onChatScroll() {
    let curPos = this.chatContainer.nativeElement.scrollTop;
    let topPos = this.chatContainer.nativeElement.scrollHeight - this.chatContainer.nativeElement.clientHeight;
    this.chatStickToBottom = curPos >= topPos;
  }

  sendMessage() {
    this.roomService.sendChatMessage(this.myMessage);
    this.clearMessage();
  }

  clearMessage() {
    this.myMessage = '';
  }

  changeUserName() {
    this.roomService.changeUserName(this.userName);
    this.userNameChanged = false;
  }

  resetUsername() {
    this.userName = this.currentUser.name;
    this.userNameChanged = false;
  }

  enterRoom(room: Room) {
    this.roomService.enterRoom(room.id);
  }

  leaveRoom() {
    this.roomService.leaveRoom();
  }

  changeRoomName() {
    this.roomService.changeRoomName(this.roomName);
    this.roomNameChanged = false;
  }

  resetRoomName() {
    this.roomName = this.room.name;
    this.roomNameChanged = false;
  }

  onMaxUsersChanged(maxUsers: number) {
    this.roomService.setMaxUsers(maxUsers);
  }

  onRoomLockChanged(lock: boolean) {
    this.roomService.setRoomLock(lock);
  }
}
