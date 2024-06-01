import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';
import Binance, { CandleChartInterval } from 'binance-api-node';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BinanceService } from '../services/binance.service';
import { CoinGeckoService } from "../services/coingecko.service";
import { CoinMarketCapService } from "../services/coinmarketcap.service";

@Component({
  selector: 'app-market-overview',
  templateUrl: './market-overview.component.html',
  styleUrls: ['./market-overview.component.css']
})

export class MarketOverviewComponent implements OnInit, AfterViewInit {

  limit: number = 3;

  marketData: any;
  datasuffixes: any;

  TopVolume: any;
  TopGainerCoin: any;
  NewListingCoins: any;
  HotCoins: any;

  colorXanh: any = "#0ECB81";
  colorDo: any = "#F6465D";

  coinData: any[] = [];

  constructor(
    private binanceService: BinanceService,
    private coinGeckoService: CoinGeckoService,
    private coinMarketCapService: CoinMarketCapService,
    private renderer: Renderer2)
  { }

  getTopVolumeCoins(data: any[], limit: number): any[] {
    let filteredData = data.filter(coin => coin.symbol !== 'USDT' && coin.symbol !== 'USDC' && coin.symbol !== 'FDUSD');
    let sortedData = filteredData.sort((a, b) => b.quote.USD.volume_24h - a.quote.USD.volume_24h);
    return sortedData.slice(0, limit);
  }

  getTopGainerCoins(data: any[], limit: number): any[] {
    let filteredData = data.filter(coin =>
      coin.symbol !== 'USDT'
      && coin.symbol!== 'USDC'
      && coin.symbol!== 'FDUSD'
    );
    let sortedData = filteredData.sort((a, b) => b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h);
    return sortedData.slice(0, limit);
  }

  getHotCoins(data: any[], limit: number): any[] {
    let yan = data.sort((a, b) => b.market_cap - a.market_cap);
    let kan = yan.slice(0, limit);
    let yen = kan.sort((a, b) => b.change - a.change);
    return yen.slice(0, limit);
  }

  NewListing(data: any[], limit: number): any[] {
    return data.slice( limit);
  }

  sortMarketCap(data: any[], limit: number): any[] {
    let yan = data.sort((a, b) => b.market_cap - a.market_cap);
    return yan.slice(0, limit);
  }

  ngOnInit(): void{

    // this.coinMarketCapService.getListings().subscribe(x => {
    //   // this.TopVolume = this.getTopVolumeCoins(x.data, this.limit);
    //   this.TopGainerCoin = this.getTopGainerCoins(x.data, this.limit);
    //   console.log('yang', this.TopGainerCoin)
    //   // let ids = this.TopVolume.map((obj:any) => obj.id).join(',');

    //   // this.coinMarketCapService.getInfo(ids).subscribe(v => {
    //   //   this.TopVolume = this.TopVolume.map((coin:any) => {
    //   //     const info = v.data[coin.id];
    //   //     if (info) {
    //   //       coin.logo = info.logo;
    //   //     }
    //   //     return coin;
    //   //   });
    //   // });
    // })

    this.binanceService.getMarketOverviewUpdatesUSDT().subscribe(x => {

      let sortedData = x.sort((a:any, b:any) => b.q - a.q);
      console.log('55', sortedData);

    })
  }

  ngAfterViewInit() {
  }

  getCoinColor(value: string): string {
    let numberValue = parseFloat(value);
    if (isNaN(numberValue)) {
        return 'white';
    } else {
        return numberValue >= 0 ? this.colorXanh : this.colorDo;
    }
  }

  formatChange(value: number): string {
    return value.toFixed(2);
  }

  toUpperCase(str: string): string {
    return str.toUpperCase();
  }

}
