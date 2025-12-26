import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeNgModule } from '../primeng.module';
import { TherapistPayoutComponent } from './therapist-payout.component';
import { TherapistPayoutRoutingModule } from './therapist-payout-routing.module';

@NgModule({
  declarations: [
    TherapistPayoutComponent
  ],
  imports: [
    CommonModule,
    TherapistPayoutRoutingModule,
    ReactiveFormsModule,
    PrimeNgModule,
  ],
  providers: [
    MessageService
  ]
})
export class TherapistPayoutModule { }
