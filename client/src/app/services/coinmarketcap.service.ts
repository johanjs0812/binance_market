import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class CoinMarketCapService {

  constructor(private http: HttpClient) { }

  private apiKey = '4ac9ebe5-2daa-4c05-aef2-b9aea7755bb2';
  private infoUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/info';

  private port = 'http://localhost:3000'

  getListings(): Observable<any> {
    return this.http.get(`${this.port}/cryptocurrency/listings/latest`);
  }

  getInfo(ids: string): Observable<any> {
    return this.http.get(`${this.port}/cryptocurrency/info/${ids}`);
  }


}
