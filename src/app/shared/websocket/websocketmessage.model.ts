export class WebSocketMessage {
  type: WebSocketMessageType;
  message: any;

  constructor(type: WebSocketMessageType, message?: any) {
    this.type = type;
    this.message = message;
  }
}
