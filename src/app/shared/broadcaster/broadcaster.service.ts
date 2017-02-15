import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import {Injectable} from "@angular/core";
import {BroadcastTopic} from "./broadcasttopic.enum";

interface BroadcastEvent {
  key: BroadcastTopic;
  data?: any;
}

@Injectable()
export class BroadcasterService {
  private _eventBus: Subject<BroadcastEvent>;

  constructor() {
    this._eventBus = new Subject<BroadcastEvent>();
  }

  broadcast(key: BroadcastTopic, data?: any) {
    this._eventBus.next({key, data});
  }

  on<T>(key: BroadcastTopic): Observable<T> {
    return this._eventBus.asObservable()
      .filter(event => event.key === key)
      .map(event => <T>event.data);
  }
}
