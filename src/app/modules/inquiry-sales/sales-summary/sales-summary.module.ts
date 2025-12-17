import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesSummaryComponent } from './sales-summary.component';
import { SalesSummaryRoutingModule } from './sales-summary-routing.module';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { PrimeNgModule } from '../../../modules/primeng.module';

@NgModule({
  declarations: [
    SalesSummaryComponent
  ],
  imports: [
    CommonModule,
    SalesSummaryRoutingModule,
    ReactiveFormsModule,
    PrimeNgModule,
    TableModule,
    CalendarModule,
    DropdownModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    MessagesModule
  ],
  providers: [
    MessageService
  ]
})
export class SalesSummaryModule { }