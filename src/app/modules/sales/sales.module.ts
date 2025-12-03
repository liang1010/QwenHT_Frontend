import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
import { PrimeNgModule } from '../primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    SalesComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    PrimeNgModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class SalesModule { }