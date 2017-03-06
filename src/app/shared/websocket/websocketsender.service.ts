import {Injectable} from '@angular/core';
import {WebSocketService} from './websocket.service';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';
import {WebSocketMessage} from './websocketmessage.model';
import {WebSocketMessageHandler, WebSocketReceiverService} from './websocketreceiver.service';

@Injectable()
export class WebSocketSenderService {
  constructor(private webSocketService: WebSocketService,
              private webSocketReceiverService: WebSocketReceiverService) {

  }

  private send(message: WebSocketMessage) {
    this.webSocketService.send(message);
  }

  sendChatMessage(text: string) {
    this.send(new WebSocketMessage(WebSocketMessageType.chat_new_message, text));
  }

  requestProgramState(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.webSocketReceiverService.registerOnce(
        new WebSocketMessageHandler(WebSocketMessageType.get_state, (data) => {
          resolve(data);
        }));
      this.send(new WebSocketMessage(WebSocketMessageType.get_state));
      setTimeout(() => reject(), 10000);
    });
  }
}
