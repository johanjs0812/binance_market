import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChartComponent } from './chart/chart.component';
import { OrderBookComponent } from "./order-book/order-book.component";
import { MarketOverviewComponent } from "./market-overview/market-overview.component";

const routes: Routes = [

  { path: '', component: ChartComponent },
  { path: 'chart', component: ChartComponent },
  { path: 'orderbook', component: OrderBookComponent },
  { path: 'market', component: MarketOverviewComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
