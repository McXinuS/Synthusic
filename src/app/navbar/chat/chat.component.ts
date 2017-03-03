import { Component, OnInit } from '@angular/core';
import {ChatService} from '../../shared/chat/chat.service';
import {Chat} from '../../shared/chat/chat.model';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  messages: Observable<Chat[]>;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.messages = this.chatService.messages;
  }

}
