import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, interval, forkJoin } from 'rxjs';
import { map, catchError, startWith, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class CoinGeckoService {

  constructor(private http: HttpClient) { }

  getCoinData(){
    return this.http.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`);
  }

  private baseUrl = 'http://localhost:3000'; 

  getCoinDataSSS(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/coins/${id}`);
  }

  getMultipleCoinsData(ids: string[]): Observable<any[]> {
    const idsParam = ids.join(',');
    return this.http.get<any[]>(`${this.baseUrl}/coins?ids=${idsParam}`);
  }

}
