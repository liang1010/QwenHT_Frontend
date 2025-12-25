import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommissionSettingRoutingModule } from './commission-setting-routing.module';
import { PrimeNgModule } from '../primeng.module';
import { CommissionSettingComponent } from './commission-setting.component';


@NgModule({
  declarations: [
    CommissionSettingComponent
  ],
  imports: [
    CommonModule,
    CommissionSettingRoutingModule,
    PrimeNgModule
  ]
})
export class CommissionSettingModule { }
