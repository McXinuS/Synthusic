import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {ChatMessage} from './chat.model';

@Injectable()
export class RoomService {
  private _messages: ChatMessage[] = [];
  private messagesSource: Subject<ChatMessage[]>;
  messages$: Observable<ChatMessage[]>;

  private readonly MaxMessagesInChat = 100;

  constructor() {
    this.messagesSource = new Subject();
    this.messages$ = this.messagesSource.asObservable();
    // DEBUG
    let n = 0;
    setInterval(() => {
      this.addMessage(new ChatMessage(0, 'Test message ' + n++));
    }, 2500);
  }

  addMessage(message: ChatMessage) {
    if (this._messages.length >= this.MaxMessagesInChat) {
      this._messages.shift();
    }
    this._messages.push(message);
    this.messagesSource.next(this._messages);
  }
}
