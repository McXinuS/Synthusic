import {Component, OnInit, ElementRef, ViewChild, AfterViewChecked} from '@angular/core';
import {RoomService} from '../../shared/room/room.service';
import {ChatMessage} from '../../shared/room/chat.model';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, AfterViewChecked {

  @ViewChild('chat') private chatContainer: ElementRef;
  chatStickToBottom: boolean = true;
  messages: Observable<ChatMessage[]>;

  constructor(private chatService: RoomService) { }

  ngOnInit() {
    this.messages = this.chatService.messages$;
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
}
