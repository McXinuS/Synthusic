import {WebSocketMessageType} from "../../../../shared/web-socket-message-types";

export class WebSocketMessage {
  type: WebSocketMessageType;
  data: any;

  constructor(type: WebSocketMessageType, data?: any) {
    this.type = type;
    this.data = data;
  }
}
