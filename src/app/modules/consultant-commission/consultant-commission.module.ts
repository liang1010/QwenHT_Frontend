import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeNgModule } from '../primeng.module';
import { ConsultantCommissionComponent } from './consultant-commission.component';
import { ConsultantCommissionRoutingModule } from './consultant-commission-routing.module';

@NgModule({
  declarations: [
    ConsultantCommissionComponent
  ],
  imports: [
    CommonModule,
    ConsultantCommissionRoutingModule,
    ReactiveFormsModule,
    PrimeNgModule,
  ],
  providers: [
    MessageService
  ]
})
export class ConsultantCommissionModule { }
