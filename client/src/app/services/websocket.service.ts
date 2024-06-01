import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private subject: WebSocketSubject<any> = webSocket('wss://stream.binance.com:9443/ws');

  connect(url: string): Observable<any> {
    this.subject = webSocket(url);

    return new Observable(observer => {
      this.subject.subscribe(
        msg => {
          // message received: send it to the observer
          observer.next(msg);
        },
        err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
        () => console.log('complete') // Called when connection is closed (for whatever reason).
      );

      // When the observer unsubscribes, close the websocket
      return () => this.subject.complete();
    });
  }
}
