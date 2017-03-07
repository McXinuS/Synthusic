import {Injectable} from '@angular/core';
import {WebSocketMessage} from './websocketmessage.model';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';
import {WebSocketReceiver, WebSocketMessageHandler} from './websocketreceiver';
import {WebSocketClient} from "./websocketclient";

// TODO implement reconnecting

@Injectable()
export class WebSocketService {
  private client: WebSocketClient;
  private receiver: WebSocketReceiver;

  constructor() {
    this.client = new WebSocketClient();
  }

  private send(message: WebSocketMessage) {
    this.client.send(message);
  }

  sendChatMessage(text: string) {
    this.send(new WebSocketMessage(WebSocketMessageType.chat_new_message, text));
  }

  requestProgramState(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.receiver.registerOnce(
        new WebSocketMessageHandler(WebSocketMessageType.get_state, (data) => {
          resolve(data);
        }));
      this.send(new WebSocketMessage(WebSocketMessageType.get_state));
      setTimeout(() => reject(), 10000);
    });
  }
}
