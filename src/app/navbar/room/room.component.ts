import {Component, OnInit, ElementRef, ViewChild, AfterViewChecked, Input, Output, EventEmitter} from '@angular/core';
import {RoomService} from '../../shared/room/room.service';
import {ChatMessage} from '../../shared/room/chat.model';
import {Observable} from 'rxjs';
import {Room} from "../../shared/room/room.model";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, AfterViewChecked {

  @Output() newChatMessage = new EventEmitter();

  room: Observable<Room>;
  roomName: string;
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
    this.room = this.roomService.room$;
    this.room.subscribe(room => {
      this.roomName = room.name;
      if (!this.userNameChanged) {
        this.userName = this.roomService.currentUser.name;
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
    if (messages && messages[messages.length-1].sender !== this.roomService.currentUser.id) {
      this.newChatMessage.emit();
    }

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
    this.chatStickToBottom = this.chatContainer.nativeElement.scrollTop
      >= this.chatContainer.nativeElement.scrollHeight - this.chatContainer.nativeElement.clientHeight;
  }

  sendMessage() {
    this.roomService.sendChatMessage(this.myMessage);
  }

  changeUserName() {
    this.roomService.changeUserName(this.userName);
    this.userNameChanged = false;
  }

  userNameReset() {
    this.userName = this.roomService.currentUser.name;
    this.userNameChanged = false;
  }
}
