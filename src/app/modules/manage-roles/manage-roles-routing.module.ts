import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageRolesComponent } from './manage-roles.component';

const routes: Routes = [
  {
    path: '',
    component: ManageRolesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRolesRoutingModule { }