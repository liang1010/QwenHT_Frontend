import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsultantCommissionComponent } from './consultant-commission.component';

const routes: Routes = [
  {
    path: '',
    component: ConsultantCommissionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultantCommissionRoutingModule { }
