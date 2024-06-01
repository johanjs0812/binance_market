import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';
import { BinanceService } from '../services/binance.service';
import Binance, { CandleChartInterval } from 'binance-api-node';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})

export class ChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') chartElement!: ElementRef;
  @ViewChild('volume') volumeElement!: ElementRef;

  constructor(
    private binanceService: BinanceService,
    private renderer: Renderer2)
  { }

  today: any;
  Priceopen: any;
  Priceclose: any;
  Pricehigh: any;
  Pricelow: any;
  change: any;
  amplitude: any;

  change24h: any;
  change24hphantram: any;
  high24h: any;
  low24h: any;
  volume24hBTC: any;
  volume24hUSDT: any;
  lastprice: any;
  color24: any;
  colorTraview: any;

  orderBook: any;
  asks: any;
  amountAsks: any;
  bids: any;
  amountBids: any;

  color: any = '';
  icon: any = '';

  tylemua: any;
  tyleban: any;

  candles: any;

  ngOnInit() {}

  // Tính toán MA
  calculateMA(data: { time: string, close: number }[], period: number) {
    let result = [];
    for (let i = 0; i < period; i++) {
      result.push({ time: data[i].time, value: NaN });
    }
    for (let i = period; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close; // Lấy giá đóng cửa
      }
      result.push({ time: data[i].time, value: sum / period });
    }
    return result;
  }

  //LAY INFOR NGAY MOI NHAT
  lastedDay(){
    this.binanceService.getCandlesRealTime('BTCUSDT', '@kline_1d').subscribe(info => {
      // console.log('<>', info);

      this.today = new Date(info.k.T).toISOString().split('T')[0];

      this.Priceopen = info.k.o;
      this.Pricehigh = info.k.h;
      this.Pricelow = info.k.l;
      this.Priceclose = info.k.c;

      this.Priceopen = parseFloat(this.Priceopen);
      this.Priceclose = parseFloat(this.Priceclose);
      this.Pricehigh = parseFloat(this.Pricehigh);
      this.Pricelow = parseFloat(this.Pricelow);

      this.change = Number((((this.Priceclose - this.Priceopen) / this.Priceopen) * 100).toFixed(2));

      // Kiểm tra xem change24h có phải là giá trị âm hay không
      let isDecreased = Math.sign(this.change) === -1;
      //CHANGE COLOR 24h
      if (isDecreased) {
        //giam
        this.colorTraview = 'rgb(246, 70, 93)';
      } else {
        //tang
        this.colorTraview = 'rgb(14, 203, 129';
      }

      this.amplitude = Number((((this.Pricehigh - this.Pricelow) / this.Pricelow) * 100).toFixed(2));

    });
  }

  //TINH TOAN AP LUC MUA
  calculatePercentage(volume: any, MIN_VOLUME:any) {
    return (volume / MIN_VOLUME) * 100;
  }

  //ĐỂ ĐẢM BẢO HTML ĐƯỢC TẠO RA XONG MỚI BẮT ĐẦU THAO TÁC
  ngAfterViewInit() {
    //CANDLESTICK
    const chart = createChart(this.chartElement.nativeElement, {
      width: this.chartElement.nativeElement.offsetWidth,
      height: this.chartElement.nativeElement.offsetHeight
    });

    const candleSeries = chart.addCandlestickSeries();
    // console.log('x12', candleSeries); // Kiểm tra xem candleSeries có được xác định đúng không
    // Đặt màu nền và màu viền lưới cho biểu đồ
    chart.applyOptions({
      layout: {
        background: { color: '#181A20' }, // Màu nền
        textColor: '#ffffff' // Màu chữ
      },
      grid: {
        vertLines: {
          color: 'rgb(37, 41, 48)' // Màu viền lưới dọc
        },
        horzLines: {
          color: 'rgb(37, 41, 48)' // Màu viền lưới ngang
        }
      }
    });

    // Điều chỉnh scaleMargins của chuỗi nến Nhật
    candleSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0, // Điểm cao nhất
        bottom: 0.3, // Điểm thấp nhất
      },
    });

    //VOLUME
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Đặt là một overlay bằng cách đặt priceScaleId trống
    });

    // Áp dụng scaleMargins cho priceScale của chuỗi
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // Điểm cao nhất
        bottom: 0, // Điểm thấp nhất
      },
    });

    //UPDATED NẾN, VOLUME REAL TIME
    this.binanceService.getCandles('BTCUSDT', CandleChartInterval.ONE_DAY).then(candles => {

      const data = candles.map(candle => ({
        time: new Date(candle.closeTime).toISOString().split('T')[0],
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
        openT: candle.openTime
      }));

      const volumeData = candles.map(candle => ({
        time: new Date(candle.closeTime).toISOString().split('T')[0],
        value: parseFloat(candle.volume),
        color: candle.open < candle.close ? '#26a69a' : '#ef5350'
      }));

      this.binanceService.getCandlesRealTime('BTCUSDT', '@kline_1d').subscribe(x => {
        if (x.e === 'kline') {

          if (data.length > 0 && data[data.length - 1].openT === x.k.t) {
            const lastCandle = {
              time: new Date(x.k.T).toISOString().split('T')[0],
              open: parseFloat(x.k.o),
              high: parseFloat(x.k.h),
              low: parseFloat(x.k.l),
              close: parseFloat(x.k.c),
              openT: x.k.t
            }

            const lastVolume = {
              time: new Date(x.k.T).toISOString().split('T')[0],
              value: parseFloat(x.k.v),
              color: x.k.o < x.k.c ? '#26a69a' : '#ef5350'
            }

            data[data.length - 1] = lastCandle;
            volumeData[volumeData.length - 1] = lastVolume;

          } else if (x.k.x) {

            const lastCandle = {
              time: new Date(x.k.T).toISOString().split('T')[0],
              open: parseFloat(x.k.o),
              high: parseFloat(x.k.h),
              low: parseFloat(x.k.l),
              close: parseFloat(x.k.c),
              openT: x.k.t
            }

            const lastVolume = {
              time: new Date(x.k.T).toISOString().split('T')[0],
              value: parseFloat(x.k.v),
              color: x.k.o < x.k.c ? '#26a69a' : '#ef5350'
            }

            data.push(lastCandle);
            volumeData.push(lastVolume);
          }
        };
        candleSeries.setData(data);
        volumeSeries.setData(volumeData);
      });

      this.lastedDay();

      //DI CHUOT HIỆN CHỈ BÁO
      chart.subscribeCrosshairMove((param: any) => {
        if (!param.time || !param.seriesData || param.seriesData.size === 0) {
          this.lastedDay();
          return;
        }

        const price = param.seriesData.get(candleSeries);
        if (!price) {
          this.lastedDay();
          return;
        }

        this.today = price.time;
        this.Priceopen = price.open;
        this.Pricehigh = price.high;
        this.Pricelow = price.low;
        this.Priceclose = price.close;

        this.change = (((price.close - price.open) / price.open) * 100).toFixed(2);

        // Kiểm tra xem change24h có phải là giá trị âm hay không
        let isDecreased = Math.sign(this.change) === -1;

        //CHANGE COLOR 24h
        if (isDecreased) {
          //giam
          this.colorTraview = 'rgb(246, 70, 93)';
        } else {
          //tang
          this.colorTraview = 'rgb(14, 203, 129';
        }

        this.amplitude = (((price.high - price.low) / price.low) * 100).toFixed(2);
      });

      // Tính toán và thêm các MA vào biểu đồ
      const ma7Data = this.calculateMA(data, 7); // Tính MA 7 ngày
      const ma7Series = chart.addLineSeries({
        color: 'rgba(241, 156, 56, 0.7)',
        lineWidth: 1
      });
      ma7Series.setData(ma7Data);

      const ma25Data = this.calculateMA(data, 25); // Tính MA 25 ngày
      const ma25Series = chart.addLineSeries({
        color: 'rgba(234, 61, 247, 0.7)',
        lineWidth: 1
      });
      ma25Series.setData(ma25Data);

      const ma99Data = this.calculateMA(data, 99); // Tính MA 99 ngày
      const ma99Series = chart.addLineSeries({
        color: 'rgba(116, 252, 253, 0.7)',
        lineWidth: 1
      });
      ma99Series.setData(ma99Data);

    });

    //LAY 24H REAL TIME
    this.binanceService.getRealTimeUpdates('BTCUSDT', (info:any) => {
      // console.log('<>', info);
      if (Array.isArray(info)) {
        info = info[0];
      }

      this.change24h=Number(info.priceChange).toLocaleString('en-US');
      this.change24hphantram=Number(info.priceChangePercent).toLocaleString('en-US');

      // Kiểm tra xem change24h có phải là giá trị âm hay không
      let change24h = Number(info.priceChange.replace(/,/g, ''));
      let isDecreased = Math.sign(change24h) === -1;

      //CHANGE COLOR 24h
      if (isDecreased) {
        this.color24 = 'rgb(246, 70, 93)';
      } else {
        this.color24 = 'rgb(14, 203, 129';
      }

      this.high24h=Number(info.high).toLocaleString('en-US');
      this.low24h=Number(info.low).toLocaleString('en-US');

      this.volume24hBTC=Number(info.volume).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      this.volume24hUSDT=Number(info.volumeQuote).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

      this.lastprice=Number(info.curDayClose).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    });

    this.bids = [];
    this.asks = [];

    //CÂN ĐỐI CUNG VÀ CẦU
    this.binanceService.getRealTimeOrderBook('BTCUSDT').subscribe(data => {
      // console.log('what', data);
      let limitFixed = 2;
      let maxTp = 7;

      let departMent = 0;
      let limitOrder = 12;

      let limiColor = 0.1;

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

      // Tính tổng khối lượng lệnh mua
      let totalBids = this.bids.reduce((total: number, bid: any[]) => total + parseFloat(bid[1]), 0);

      // Tính tổng khối lượng lệnh bán
      let totalAsks = this.asks.reduce((total: number, ask: any[]) => total + parseFloat(ask[1]), 0);

      // Tính tổng khối lượng của cả lệnh mua và lệnh bán
      let total = totalBids + totalAsks;

      // Tính tỷ lệ phần trăm của lệnh mua và lệnh bán
      let percentBids = (totalBids / total) * 100;
      let percentAsks = (totalAsks / total) * 100;

      // Gán tỷ lệ phần trăm cho biến `tylemua` và `tyleban`
      this.tylemua = percentBids.toFixed(2) + '%';
      this.tyleban = percentAsks.toFixed(2) + '%';

      //COLOR RED & GREEN

      if (percentBids > percentAsks) {
        this.color = 'rgb(14, 203, 129)';
        this.icon = 'bx bx-up-arrow-alt';
      }
      else if(percentBids < percentAsks){
        this.color = 'rgb(246, 70, 93)';
        this.icon = 'bx bx-down-arrow-alt';
      }
    });
  }

}
