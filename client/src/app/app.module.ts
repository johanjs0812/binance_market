import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule} from '@angular/core';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { MarketOverviewComponent } from "./market-overview/market-overview.component";
import { OrderBookComponent } from "./order-book/order-book.component";

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    MarketOverviewComponent,
    OrderBookComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
