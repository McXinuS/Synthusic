import {WebSocketMessageType} from '@shared-global/web-socket-message-types';

export class WebSocketMessage {
  type: WebSocketMessageType;
  data: any;

  constructor(type: WebSocketMessageType, data?: any) {
    this.type = type;
    this.data = data;
  }
}

export class WebSocketMessageHandler {
  type: WebSocketMessageType;
  callback: (data: any) => any;

  constructor(type: WebSocketMessageType, callback: (data: any) => any) {
    this.type = type;
    this.callback = callback;
  }
}
