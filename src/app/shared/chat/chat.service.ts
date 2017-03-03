import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Chat} from './chat.model';
import {BroadcasterService} from '../broadcaster/broadcaster.service';
import {BroadcastTopic} from '../broadcaster/broadcasttopic.enum';

@Injectable()
export class ChatService {
  _messages: Chat[] = [];
  public messages: Observable<Chat[]>;

  readonly MaxMessages = 100;

  constructor(private broadcaster: BroadcasterService) {
    this.messages = new Observable(observer => {
      this.broadcaster.on(BroadcastTopic.chatMessage).subscribe(
        (message: Chat) => {
          if (this._messages.length >= this.MaxMessages) {
            this._messages.shift();
          }
          this._messages.push(message);
          observer.next(this._messages);
        }
      );
    });

    let n = 0;
    setInterval(() => {
      this.broadcaster.broadcast(
        BroadcastTopic.chatMessage,
        {sender: 0, message: 'Test message ' + n++});
    }, 2500);
  }
}
