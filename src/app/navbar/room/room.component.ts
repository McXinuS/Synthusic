import {Component, OnInit, ElementRef, ViewChild, AfterViewChecked} from '@angular/core';
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

  chatMessages: ChatMessage[];
  room: Observable<Room>;
  isChatEmpty: boolean = true;
  @ViewChild('messages') private chatContainer: ElementRef;
  chatStickToBottom: boolean = true;

  myMessage: string;

  constructor(private roomService: RoomService) {
  }

  ngOnInit() {
    this.room = this.roomService.room$;
    this.roomService.messages$.subscribe(messages => {
      this.chatMessages = messages;
      this.isChatEmpty = messages.length === 0;
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
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
}
