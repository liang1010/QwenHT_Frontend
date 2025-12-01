import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing.component';
import { LandingRoutingModule } from './landing-routing.module';
import { PrimeNgModule } from '../primeng.module';

@NgModule({
  imports: [
    CommonModule,
    LandingRoutingModule,
    PrimeNgModule
  ],
  declarations: [LandingComponent]
})
export class LandingModule { }
