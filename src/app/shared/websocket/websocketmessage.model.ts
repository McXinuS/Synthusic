export enum WebSocketMessageType{
  play_note = 0,
  stop_note = 1,
  stop = 5,
  instrument_add = 10,
  instrument_update = 11,
  instrument_remove = 12,
  register = 20,
  ping = 100, // keep connection alive (from client)
  pong = 101  // keep connection alive (from server)
}

export class WebSocketMessage {
  type: WebSocketMessageType;
  message: any;

  constructor(type: WebSocketMessageType, message?: any) {
    this.type = type;
    this.message = message;
  }
}
