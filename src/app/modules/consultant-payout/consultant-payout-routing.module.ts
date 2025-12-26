import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsultantPayoutComponent } from './consultant-payout.component';

const routes: Routes = [
  {
    path: '',
    component: ConsultantPayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultantPayoutRoutingModule { }
