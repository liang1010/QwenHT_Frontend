import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesSummaryComponent } from './sales-summary.component';

const routes: Routes = [
  {
    path: '',
    component: SalesSummaryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesSummaryRoutingModule { }