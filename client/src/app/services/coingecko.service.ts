import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, interval } from 'rxjs';
import { map, catchError, startWith, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class CoinGeckoService {

  constructor(private http: HttpClient) { }
  
  getCoinData(){
    return this.http.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`);
  }

}
