import {Injectable} from '@angular/core';
import {WebSocketMessage, WebSocketMessageHandler} from './websocketmessage.model';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';
import {WebSocketClient} from './websocketclient';

// TODO implement reconnecting

@Injectable()
export class WebSocketService {
  private client: WebSocketClient;
  private messageHandlers: Array<WebSocketMessageHandler> = [];
  private oneTimeMessageHandlers: Array<WebSocketMessageHandler> = [];

  constructor() {
    this.client = new WebSocketClient(this.onMessage.bind(this));
  }

  private onMessage(message: WebSocketMessage) {
    for (let handler of this.messageHandlers) {
      if (handler.type === message.type) {
        handler.callback(message.data);
      }
    }

    for (let i = this.oneTimeMessageHandlers.length - 1; i >= 0; i--) {
      if (this.oneTimeMessageHandlers[i].type === message.type) {
        this.oneTimeMessageHandlers[i].callback(message.data);
        this.oneTimeMessageHandlers.splice(i, 1);
      }
    }
  }

  init(host: string) {
    this.client.connect(host);
  }

  send(type: WebSocketMessageType, data?: any) {
    this.client.send(new WebSocketMessage(type, data));
  }

  registerHandler(type: WebSocketMessageType, callback: (msg: any) => any) {
    this.messageHandlers.push(new WebSocketMessageHandler(type, callback));
  }

  registerHandlerOnce(type: WebSocketMessageType, callback: (msg: any) => any) {
    this.oneTimeMessageHandlers.push(new WebSocketMessageHandler(type, callback));
  }

  requestProgramState(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.registerHandlerOnce(
        WebSocketMessageType.get_state,
        (data) => {
          resolve(data);
        });
      this.send(WebSocketMessageType.get_state);
      setTimeout(() => reject(), 10000);
    });
  }

  isSocketReady() {
    return this.client.isSocketReady;
  }

  disconnect() {
    this.client.disconnect();
  }
}
