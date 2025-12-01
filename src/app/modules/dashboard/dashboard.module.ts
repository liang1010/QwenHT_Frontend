import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardsRoutingModule } from './dashboard-routing.module';
import { PrimeNgModule } from '../primeng.module';

@NgModule({
  imports: [
    CommonModule,
    PrimeNgModule,
    DashboardsRoutingModule,
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
