import { Injectable } from '@angular/core';
import Binance, { CandleChartInterval } from 'binance-api-node';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, forkJoin  } from 'rxjs';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})

export class BinanceService {

  private client = Binance();

  constructor(
    private http: HttpClient,
    private websocketService: WebsocketService
  ) { }

  // Phương thức để lấy nen nhat
  getCandles(symbol: string, interval: CandleChartInterval) {
    return this.client.candles({ symbol, interval });
  }

  //Nen nhat real time
  getCandlesRealTime(symbol: string, time: string) {
    // const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1d`;
    const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}${time.toLowerCase()}`;
    return this.websocketService.connect(url);
  }

  // Phương thức để lấy thông tin mới nhất của ngày hiện tại
  getLatestDay(symbol: string) {
    return this.client.candles({ symbol, interval: CandleChartInterval.ONE_DAY, limit: 1 })
      .then(candles => candles[0]);
  }

  // Phương thức để lấy thông tin theo thời gian thực
  getRealTimeUpdates(symbol: string, callback: (ticker: any) => void) {
    return this.client.ws.ticker(symbol, callback);
  }

  // Phương thức để lấy thông tin 24 giờ
  get24hr(symbol: string) {
    return this.client.futuresDailyStats({ symbol });
  }

  //Lịch sử mua bán
  getTradeHistory(symbol: string) {
    return this.client.trades({ symbol: symbol });
  }

  //Order book
  getOrderBook(symbol: string, limit: number = 20) {
    return this.http.get(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`);
  }

  // Order book real time
  getRealTimeOrderBook(symbol: string): Observable<any> {
    const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth`;
    return this.websocketService.connect(url);
  }

  // Phương thức để lấy thông tin tổng quan về thị trường
  getMarketOverviewUpdates(): Observable<any> {
    const url = 'wss://stream.binance.com:9443/ws/!ticker@arr';
    return this.websocketService.connect(url);
  }

  getMarketOverviewUpdatesUSDT(): Observable<any> {
    const url = 'wss://stream.binance.com:9443/ws/!ticker@arr';
    return this.websocketService.connect(url).pipe(
        map((data:any) => data.filter((item:any )=> item.s.endsWith('USDT')).map((item:any) => {
            item.s = item.s.replace('USDT', '');
            return item;
        }))
    );
  }

  // Phương thức để lấy tất cả các hậu tố từ Binance
  getAllSuffixes(): Promise<Set<string>> {
    return this.client.exchangeInfo()
      .then(info => {
        let suffixes = new Set<string>();
        for (let symbolInfo of info.symbols) {
          let symbol = symbolInfo.symbol;
          let baseAsset = symbolInfo.baseAsset;
          let suffix = symbol.slice(baseAsset.length);
          suffixes.add(suffix);
        }
        return suffixes;
      });
  }

  newListing2024(){
    return [
      {s: 'NOT', time: '2024-05-16', n: 'notcoin'},
      {s: 'BB', time: '2024-05-13', n: 'bouncebit'},
      {s: 'REZ', time: '2024-04-30', n: 'renzo'},
      {s: 'OMNI', time: '2024-04-17', n: 'omni network'},
      {s: 'TAO', time: '2024-04-11', n: 'bittensor'},
      {s: 'SAGA', time: '2024-04-09', n: 'sage'},
      {s: 'TNSR', time: '2024-04-08', n: 'tensor'},
      {s: 'W', time: '2024-04-03', n: 'wormhole'},
      {s: 'ENA', time: '2024-04-02', n: 'ethena'},
    ]
  }

}
