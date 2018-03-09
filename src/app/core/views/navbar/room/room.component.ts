import {Component, OnInit, ElementRef, ViewChild, AfterViewChecked, Output, EventEmitter} from '@angular/core';
import {RoomService} from '@core/services';
import {ChatMessage, Room} from '@core/models';
import {Observable} from 'rxjs';
import {User} from '@shared-global/models';

// TODO split into room-chat and room-users

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, AfterViewChecked {

  roomName: string;

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
      this.roomName = room.name;
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
}
