import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { BinanceService } from '../services/binance.service';

@Component({
  selector: 'app-order-book',
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.css']
})
export class OrderBookComponent implements OnInit, AfterViewInit{

  constructor(
    private binanceService: BinanceService,
    private renderer: Renderer2)
  { }

  asks: any;
  bids: any;

  ngOnInit(): void { }

  calculatePercentage(volume: any, MIN_VOLUME:any) {
    return (volume / MIN_VOLUME) * 100;
  }

  ngAfterViewInit(){
    this.bids = [];
    this.asks = [];

    this.binanceService.getRealTimeOrderBook('BTCUSDT').subscribe(data => {

      let limitFixed = 2;
      let maxTp = 7;

      let departMent = 0;
      let limitOrder = 15;

      let limiColor = 0.1;

      // let num1 = "66,821.12"; // Hoặc "66,821.1" hoặc "66,821"
      // let parsedNum = parseInt(num1.replace(/,/g, ""), 10);
      // console.log(parsedNum); // Kết quả: 66821

      data.b.slice(departMent, limitOrder).forEach((bid: any) => {
        let price = Number(bid[0]).toLocaleString('en-US', {minimumFractionDigits: limitFixed, maximumFractionDigits: limitFixed});
        let volume = parseFloat(bid[1]).toFixed(5);

        if (volume !== "0.00000") {
          let total = parseFloat(price) * parseFloat(volume);
          let tonglast = Number(total).toLocaleString('en-US', {minimumFractionDigits: maxTp, maximumFractionDigits: maxTp});

          let percentage = this.calculatePercentage(volume, limiColor);
          let width = percentage.toFixed(2) + '%';

          if (this.bids.length >= limitOrder) {
            this.bids.splice(0, this.bids.length - (limitOrder - 1));
          }

          this.bids.push([price, volume, tonglast, width]);
        }
      });

      data.a.slice(departMent, limitOrder).forEach((ask: any) => {
        let price = Number(ask[0]).toLocaleString('en-US', { minimumFractionDigits: limitFixed, maximumFractionDigits: limitFixed });
        let volume = parseFloat(ask[1]).toFixed(5);

        if (volume !== "0.00000") {
          let total = parseFloat(price) * parseFloat(volume);
          let tonglast = Number(total).toLocaleString('en-US', { minimumFractionDigits: maxTp, maximumFractionDigits: maxTp });

          let percentage = this.calculatePercentage(volume, limiColor);
          let width = percentage.toFixed(2) + '%';

          if (this.asks.length >= limitOrder) {
            this.asks.splice(0, this.asks.length - (limitOrder - 1));
          }

          this.asks.push([price, volume, tonglast, width]);
        }
      });

    });
  }
}
