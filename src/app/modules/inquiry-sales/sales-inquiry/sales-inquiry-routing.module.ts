import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesInquiryComponent } from './sales-inquiry.component';

const routes: Routes = [
  {
    path: '',
    component: SalesInquiryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesInquiryRoutingModule { }