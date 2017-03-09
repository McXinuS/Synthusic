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

  chatMessages: Observable<ChatMessage[]>;
  room: Observable<Room>;
  isChatEmpty: boolean = true;
  @ViewChild('chat') private chatContainer: ElementRef;
  chatStickToBottom: boolean = true;

  constructor(private roomService: RoomService) {
  }

  ngOnInit() {
    // TODO: fix messages appearing after only the second incoming message
    this.room = this.roomService.room$;
    this.chatMessages = this.roomService.messages$;
    this.roomService.messages$.subscribe(messages => this.isChatEmpty = messages.length === 0);
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

  sendMessage(message: string) {
    this.roomService.sendChatMessage(message);
    // TODO: clear text field after message is sent
  }
}
