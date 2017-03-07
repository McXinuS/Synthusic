import {WebSocketService} from './websocket.service';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';
import {WebSocketMessage} from './websocketmessage.model';
import {WebSocketMessageHandler, WebSocketReceiver} from './websocketreceiver';

export class WebSocketSender {
  constructor(private webSocketService: WebSocketService,
              private webSocketReceiver: WebSocketReceiver) {

  }
}
