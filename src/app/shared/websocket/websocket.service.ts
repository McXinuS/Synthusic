import {Injectable} from "@angular/core";
import {WebSocketMessage, WebSocketMessageType} from "./websocketmessage.model";

@Injectable()
export class WebSocketService {
  onmessage: (data)=>void = null;
  onopen: ()=>void = null;

  socket: WebSocket;

  get isSocketReady(): boolean {
    return this.socket.readyState === 1;
  }

  readonly SEND_WAIT_TIME = 1000; // interval between attempts to send data in wrong socket state
  readonly RECONNECT_TIME = 10000; // time between attempts to reconnect when disconnected
  readonly PING_TIME = 30000; // interval of ping of server to keep web socket connection

  init(host: string) {
    this.connect(host);
  }

  connect(host: string) {
    let ws = new WebSocket(host);

    var pingIntervalId;
    ws.onopen = () => {
      console.info(`Connected to server`);
      pingIntervalId = setInterval(() => {
        this.sendPing();
      }, this.PING_TIME);
      if (this.onopen != null) {
        this.onopen();
      }
    };

    ws.onmessage = (event) => {
      var data = JSON.parse(event.data);
      if (this.onmessage != null) {
        this.onmessage(data);
      }
    };

    ws.onclose = () => {
      console.warn(`Socket is closed. Next attempt to reconnect in ${this.RECONNECT_TIME / 1000} seconds`);
      clearTimeout(pingIntervalId);
      setTimeout(() => {
        this.connect(host);
      }, this.RECONNECT_TIME)
    };

    this.socket = ws;
  };

  send(data: WebSocketMessage) {
    this.waitForSocketConnection((socket) => {
      socket.send(JSON.stringify(data));
    });
  };

  /**
   * Wait for socket to be ready.
   */
  waitForSocketConnection(callback) {
    if (this.isSocketReady) {
      if (callback != null) callback(this.socket);
    } else {
      setTimeout(function () {
        this.waitForSocketConnection(callback);
      }.bind(this), this.SEND_WAIT_TIME);
    }
  };

  sendPing() {
    this.send(new WebSocketMessage(WebSocketMessageType.ping));
  };

}
