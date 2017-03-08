import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {ChatMessage} from './chat.model';
import {WebSocketService} from '../websocket/websocket.service';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';

@Injectable()
export class RoomService {
  private _messages: ChatMessage[] = [];
  private messagesSource: Subject<ChatMessage[]>;
  messages$: Observable<ChatMessage[]>;

  private readonly MaxMessagesInChat = 100;

  constructor(private webSocketService: WebSocketService) {
    this.messagesSource = new Subject();
    this.messages$ = this.messagesSource.asObservable();
    this.webSocketService.registerHandler(WebSocketMessageType.chat_new_message, this.addChatMessage.bind(this));

    // DEBUG
    /*
    let n = 0;
    setInterval(() => {
      this.addChatMessage(new ChatMessage(0, 'Test message ' + n++));
    }, 2500);
    */
  }

  addChatMessage(message: ChatMessage) {
    if (this._messages.length >= this.MaxMessagesInChat) {
      this._messages.shift();
    }
    this._messages.push(message);
    this.messagesSource.next(this._messages);
  }

  sendChatMessage(message: string) {
    this.webSocketService.send(WebSocketMessageType.chat_new_message, message);
  }
}
