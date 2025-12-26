import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeNgModule } from '../primeng.module';
import { ConsultantPayoutComponent } from './consultant-payout.component';
import { ConsultantPayoutRoutingModule } from './consultant-payout-routing.module';

@NgModule({
  declarations: [
    ConsultantPayoutComponent
  ],
  imports: [
    CommonModule,
    ConsultantPayoutRoutingModule,
    ReactiveFormsModule,
    PrimeNgModule,
  ],
  providers: [
    MessageService
  ]
})
export class ConsultantPayoutModule { }
