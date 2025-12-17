import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesInquiryRoutingModule } from './sales-inquiry-routing.module';
import { SalesInquiryComponent } from './sales-inquiry.component';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../primeng.module';

@NgModule({
  declarations: [
    SalesInquiryComponent
  ],
  imports: [
    CommonModule,
    SalesInquiryRoutingModule,
    PrimeNgModule
  ]
})
export class SalesInquiryModule { }
