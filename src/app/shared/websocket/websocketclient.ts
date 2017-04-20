import {WebSocketMessage} from './websocketmessage.model';
import {WebSocketMessageType} from '../../../../shared/web-socket-message-types';

export class WebSocketClient {
  private socket: WebSocket;
  onDisconnect: () => any;

  private pendingMessages: Array<WebSocketMessage> = [];

  get isSocketReady(): boolean {
    return this.socket.readyState === 1;
  }

  private readonly SEND_WAIT_TIME = 1000; // interval between attempts to send data in wrong socket state
  // private readonly RECONNECT_TIME = 10000; // time between attempts to reconnect when disconnected
  private readonly PingInterval = 20000; // interval of ping of server to keep web socket connection alive

  constructor(private onMessage: (msg: WebSocketMessage) => any) {
  }

  connect(host: string) {
    let ws = new WebSocket(host);

    let pingIntervalId;
    ws.onopen = () => {
      console.info(`Connected to server`);

      pingIntervalId = setInterval(() => {
        this.sendPing();
      }, this.PingInterval);

      for (let msg of this.pendingMessages) {
        this.send(msg);
      }
    };

    ws.onmessage = (event) => {
      this.onMessage(JSON.parse(event.data));
    };

    ws.onclose = () => {
      console.warn(`Socket is closed. Reload the page to go online`);
      clearInterval(pingIntervalId);
      if (typeof this.onDisconnect == 'function') {
        this.onDisconnect();
      }
      /*
       console.warn(`Socket is closed. Next attempt to reconnect in ${this.RECONNECT_TIME / 1000} seconds`);
       setTimeout(() => {
       this.connect(host);
       }, this.RECONNECT_TIME);
       */
    };

    this.socket = ws;
  };

  disconnect() {
    this.socket.close();
  }

  send(data: WebSocketMessage) {
    if (this.isSocketReady) {
      this.socket.send(JSON.stringify(data));
    } else {
      this.pendingMessages.push(data);
    }
  };

  private sendPing() {
    this.send(new WebSocketMessage(WebSocketMessageType.ping));
  };
}
