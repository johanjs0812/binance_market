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

  marketcap: any;
  TopVolume: any[] = [];
  TopGainerCoin: any[] = [];
  NewListingCoins: any[] = [];
  HotCoins: any[] = [];

  CMCnewListing: any;
  colorXanh: any = "#0ECB81";
  colorDo: any = "#F6465D";

  coinData: any[] = [];

  coinInfoCache: any[] = [];

  constructor(
    private binanceService: BinanceService,
    private coinGeckoService: CoinGeckoService,
    private coinMarketCapService: CoinMarketCapService,
    private renderer: Renderer2)
  { }

  getCoinDataBinance(){
    return this.binanceService.getMarketOverviewUpdatesUSDT();
  }

  getTopVolumeCoins(data: any[], limit: number): any[] {
    let filteredData = data.filter(item =>
      item.s !== 'USDT'
      && item.s !== 'USDC'
      && item.s !== 'WBTC'
      && item.s !== 'WBETH'
      && item.s !== 'YFI'
      && item.s !== 'FDUSD'
    );
    let sortedData = filteredData.sort((a, b) => b.q - a.q);
    return sortedData.slice(0, limit);
  }

  NewListingCMC(data: any[], limit: number): any[] {
    let filteredData = data.filter(item => item.quote.USD.market_cap >= 100000000);
    let sortedData = filteredData.sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime());
    return sortedData.slice(0, limit);
   }

  coinMoiNiemYet: any [] = [];
  getNewListing(symbols: any[], objects: any[]): any[] {
    if (!symbols || !Array.isArray(symbols) || !objects || objects.length < 20) {
      return [];
    }

    let newData = objects.filter(obj => {
      return obj.s && symbols.some(symbolObj => symbolObj.symbol === obj.s.toString());
    }).map(obj => {
      let symbolObj = symbols.find(symbol => symbol.symbol === obj.s.toString());
      if (symbolObj) {
        obj.date_add = symbolObj.date_added;
      }
      return obj;
    });

    if (this.coinMoiNiemYet.length === 0) {
      this.coinMoiNiemYet = [...newData];
    }

    newData.forEach(newObj => {
      let index = this.coinMoiNiemYet.findIndex(item => item.s === newObj.s);
      if (index !== -1) {
        this.coinMoiNiemYet[index] = { ...newObj, logo: this.coinMoiNiemYet[index].logo, date_add: this.coinMoiNiemYet[index].date_add };
      } else {
        this.coinMoiNiemYet.push(newObj);
      }
    });

    this.coinMoiNiemYet.sort((a, b) => new Date(b.date_add).getTime() - new Date(a.date_add).getTime());
    return this.coinMoiNiemYet;
  }

  market_resutls:any[]= [];
  mergeArrays(array1: any, array2: any) {
    array1.forEach((item1:any) => {
        array2.forEach((item2:any) => {
            if (item1.symbol.toUpperCase() === item2.s) {
                item1.data = item2;
                this.market_resutls.push(item1);
            }
        });
    });
    return this.market_resutls;
  }

  // Hàm cập nhật thông tin logo từ cache
  updateLogoFromCache(coins: any[]) {
    return coins.map((coin:any) => {
      const symbol = coin.symbol || coin.s; // Sử dụng 's' nếu 'symbol' không tồn tại
      const info = this.coinInfoCache.find(c => c.symbol === symbol);
      if (info) {
        coin.logo = info.logo;
      }
      return coin;
    });
  }

  updateLogo(coins: any[]) {
    let symbols = coins.map((coin:any) => coin.symbol || coin.s);

    let newSymbols = symbols.filter((symbol:any) => !this.coinInfoCache.some(coin => coin.symbol === symbol));

    if (newSymbols.length > 0) {
      let symbolString = newSymbols.length > 1 ? newSymbols.join(',') : newSymbols[0];

      this.coinMarketCapService.getInfo(symbolString).subscribe(v => {
        for (let symbol of newSymbols) {
          if (v.data[symbol]) {
            this.coinInfoCache.push({symbol: symbol, logo: v.data[symbol].logo});
          }
        }
        this.updateLogoFromCache(coins);
      });

    } else {
      this.updateLogoFromCache(coins);
    }
  }

  ngOnInit(): void {
    this.coinMarketCapService.getListings().subscribe(x => {
      // console.log('hoa', x.data)
      this.CMCnewListing = this.NewListingCMC(x.data, 20);
   });

   this.coinGeckoService.getCoinData().subscribe(jp => {
      console.log('market_cap', jp)
      this.marketcap = jp;
   })
  }

  ngAfterViewInit() {

    this.getCoinDataBinance().subscribe(data => {
      // console.log('kyun', data)
      if (Array.isArray(data)) {

        this.marketData = this.mergeArrays(this.marketcap, data);
        this.marketData = this.marketData.slice(0, 30);

        this.TopVolume = this.getTopVolumeCoins(data, this.limit);
        this.updateLogo(this.TopVolume);

        this.TopGainerCoin = data.sort((a:any, b:any) => b.P - a.P).slice(0, this.limit);
        this.updateLogo(this.TopGainerCoin);

        const resListing = this.getNewListing(this.CMCnewListing, data);
        if (resListing.length >= 3) {
          this.NewListingCoins = resListing.slice(0, this.limit);
          this.updateLogo(this.NewListingCoins);
        }

        this.HotCoins = this.marketData.slice(0, 3);

      } else {
        console.error('Data is not an array:', data);
      }
    });

  }

  getCoinColor(value: any): string {
    if (typeof value === 'number') {
        return value >= 0 ? this.colorXanh : this.colorDo;
    } else {
        let numberValue = parseFloat(value);
        if (isNaN(numberValue)) {
            return 'white';
        } else {
            return numberValue >= 0 ? this.colorXanh : this.colorDo;
        }
    }
  }

  formatChange(value: any) {
    if (typeof value === 'number') {
      return value.toFixed(2);
    } else {
      return Number(value).toFixed(2);
    }
  }

  toUpperCase(str: string): string {
    return str.toUpperCase();
  }

  formatCurrency(value: any) {
    if (value == undefined && value == null) {
      return;
    }
    let numValue = parseFloat(value);
    if (isNaN(numValue)) {
      console.error('Value is not a number:', value);
      return value;
    }
    if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(2)}K`;
    } else if (numValue >= 0.01) {
      return `$${numValue}`;
    } else {
      return `$${numValue}`;
    }
  }

  formatCurrencyCMC(value: any) {
    let numValue = value;

    if (numValue === null) {
      console.error('Value is null');
      return value;
    }

    if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(2)}K`;
    } else if (numValue >= 0.01) {
      return `$${numValue.toFixed(2)}`;
    } else {
      return `$${numValue.toFixed(6)}`;
    }
  }

}
