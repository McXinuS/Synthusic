import {Injectable, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Chat} from "./chat.model";
import {BroadcasterService} from "../broadcaster/broadcaster.service";
import {BroadcastTopic} from "../broadcaster/broadcasttopic.enum";

@Injectable()
export class ChatService implements OnInit {
  public messages: Observable<Array<Chat>>;

  constructor(private broadcaster: BroadcasterService) {
    this.messages = Observable.interval(2500).map(i => [{sender: i, message: 'Test message'}]);
  }

  ngOnInit() {
    /*
    this.messages = new Observable(observer => {
      this.broadcaster.on(BroadcastTopic.chatMessage).subscribe(
        (message: Chat) => observer.next(message)
      )
    });
    */
  }
}
