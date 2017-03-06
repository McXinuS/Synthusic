import {Injectable} from '@angular/core';
import {WebSocketMessage} from './websocketmessage.model';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';

export class WebSocketMessageHandler {
  type: WebSocketMessageType;
  callback: (data: any) => any;

  constructor(type: WebSocketMessageType, callback: (data: any) => any) {
    this.type = type;
    this.callback = callback;
  }
}

@Injectable()
export class WebSocketReceiverService {
  private messageHandlers: Array<WebSocketMessageHandler> = [];
  private oneTimeMessageHandlers: Array<WebSocketMessageHandler> = [];

  constructor() {
  }

  onMessage(message: WebSocketMessage) {
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

  registerHandler(handler: WebSocketMessageHandler) {
    this.messageHandlers.push(handler);
  }

  registerOnce(handler: WebSocketMessageHandler) {
    this.oneTimeMessageHandlers.push(handler);
  }

  registerChatMessageHandler(callback: (object: any) => any) {
    this.messageHandlers.push(new WebSocketMessageHandler(WebSocketMessageType.chat_new_message, callback));
  }
}
