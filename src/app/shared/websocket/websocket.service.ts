import {Injectable} from "@angular/core";
import {WebSocketMessage} from "./websocketmessage.model";
import {BroadcasterService} from "../broadcaster/broadcaster.service";
import {WebSocketMessageType} from "../../../../shared/web-socket-message-types";

@Injectable()
export class WebSocketService {
  socket: WebSocket;
  handler: WebSocketMessageHandler;

  get isSocketReady(): boolean {
    return this.socket.readyState === 1;
  }

  readonly SEND_WAIT_TIME = 1000; // interval between attempts to send data in wrong socket state
  readonly RECONNECT_TIME = 10000; // time between attempts to reconnect when disconnected
  readonly PING_TIME = 30000; // interval of ping of server to keep web socket connection

  constructor(private broadcaster: BroadcasterService) {
    this.handler = new WebSocketMessageHandler(broadcaster);
  }

  init(host: string) {
    this.connect(host);
  }

  connect(host: string) {
    let ws = new WebSocket(host);

    let pingIntervalId;
    ws.onopen = () => {
      console.info(`Connected to server`);
      this.requestProgramState();
      pingIntervalId = setInterval(() => {
        this.sendPing();
      }, this.PING_TIME);
    };

    ws.onmessage = (event) => {
      this.handler.onMessage(event.data);
    };

    ws.onclose = () => {
      console.warn(`Socket is closed. Next attempt to reconnect in ${this.RECONNECT_TIME / 1000} seconds`);
      clearTimeout(pingIntervalId);
      setTimeout(() => {
        this.connect(host);
      }, this.RECONNECT_TIME);
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

  requestProgramState() {
    this.send(new WebSocketMessage(WebSocketMessageType.get_state));
  }
}

class WebSocketMessageHandler {
  constructor(private broadcaster: BroadcasterService) {
  }

  onMessage({type, data}: {type: number, data: any}) {

  }

  onNoteAdd() {

  }

  onNoteDelete() {

  }

  onInstrumentAdd() {

  }

  onInstrumentUpdate() {

  }

  onInstrumentDelete() {

  }

  onRoomUsersUpdate() {

  }

  onRoomNameUpdate() {

  }
}
