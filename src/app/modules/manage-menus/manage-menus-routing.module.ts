import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageMenusComponent } from './manage-menus.component';

const routes: Routes = [
  {
    path: '',
    component: ManageMenusComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageMenusRoutingModule { }