import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TherapistPayoutComponent } from './therapist-payout.component';

const routes: Routes = [
  {
    path: '',
    component: TherapistPayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TherapistPayoutRoutingModule { }
