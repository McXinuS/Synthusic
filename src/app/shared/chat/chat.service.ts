import {Injectable, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Chat} from "./chat.model";
import {BroadcasterService} from "../broadcaster/broadcaster.service";
import {BroadcastTopic} from "../broadcaster/broadcasttopic.enum";

@Injectable()
export class ChatService implements OnInit {
  public messages: Observable<Array<Chat>>;

  constructor(private broadcaster: BroadcasterService) {
    this.messages = new Observable(observer => {
      this.broadcaster.on(BroadcastTopic.chatMessage).subscribe(
        (message: Chat) => observer.next(message)
      )
    });
  }

  ngOnInit() {

    let n = 0;
    setInterval(this.broadcaster.broadcast(
        BroadcastTopic.chatMessage,
        {sender: 0, message: 'Test message ' + n++}),
      2500);
  }
}
