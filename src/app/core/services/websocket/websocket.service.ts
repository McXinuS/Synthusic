import {Injectable} from '@angular/core';
import {WebSocketMessage, WebSocketMessageHandler} from '@core/models';
import {WebSocketMessageType} from '@shared-global/web-socket-message-types';
import {WebSocketClient} from './websocketclient';

@Injectable()
export class WebSocketService {
  private client: WebSocketClient;
  private messageHandlers: Array<WebSocketMessageHandler> = [];
  private oneTimeMessageHandlers: Array<WebSocketMessageHandler> = [];

  private ResponseTimeout = 10000;

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

  /**
   * Send message without waiting for result.
   */
  send(type: WebSocketMessageType, data?: any) {
    this.client.send(new WebSocketMessage(type, data));
  }

  /**
   * Send message and wait for the result.
   */
  sendAsync<T>(type: WebSocketMessageType, data?: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.registerHandlerOnce(
        type,
        data => resolve(data)
      );
      this.send(type, data);
      setTimeout(
        () => reject(null),
        this.ResponseTimeout
      );
    });
  }

  registerHandler(type: WebSocketMessageType, callback: (msg: any) => any) {
    this.messageHandlers.push(new WebSocketMessageHandler(type, callback));
  }

  registerHandlerOnce(type: WebSocketMessageType, callback: (msg: any) => any) {
    this.oneTimeMessageHandlers.push(new WebSocketMessageHandler(type, callback));
  }

  isSocketReady() {
    return this.client.isSocketReady;
  }

  setOnDisconnect(callback: () => any) {
    this.client.onDisconnect = callback;
  }

  disconnect() {
    this.client.disconnect();
  }
}
