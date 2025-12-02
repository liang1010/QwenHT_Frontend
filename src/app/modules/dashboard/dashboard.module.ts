import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardsRoutingModule } from './dashboard-routing.module';
import { PrimeNgModule } from '../primeng.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    PrimeNgModule,
    DashboardsRoutingModule,
    HttpClientModule
  ],
  declarations: [DashboardComponent],
  providers:[]
})
export class DashboardModule { }
