import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageOptionValuesComponent } from './manage-option-values.component';

const routes: Routes = [
  {
    path: '',
    component: ManageOptionValuesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageOptionValuesRoutingModule { }