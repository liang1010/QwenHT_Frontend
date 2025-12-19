import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TherapistCommissionComponent } from './therapist-commission.component';

const routes: Routes = [
  {
    path: '',
    component: TherapistCommissionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TherapistCommissionRoutingModule { }