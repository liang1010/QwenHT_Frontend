import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageStaffComponent } from './manage-staff.component';

const routes: Routes = [
  {
    path: '',
    component: ManageStaffComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageStaffRoutingModule { }